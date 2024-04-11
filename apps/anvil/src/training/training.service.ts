import { EdgeDBService } from "@/edgedb/edgedb.service";
import { UsersService } from "@/users/users.service";
import e from "@dbschema/edgeql-js";
import { TrainingLocation } from "@dbschema/edgeql-js/modules/training";
import ErrorCodes from "@ignis/errors";
import { training } from "@ignis/types";
import { PartialTraining } from "@ignis/types/training";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CardinalityViolationError, MissingRequiredError } from "edgedb";

const TrainingSection = e.shape(e.training.Training.sections, (section) => ({
  type_name: e.select(section.__type__.name),
  id: true,
  index: true,
  content: true,
  ...e.is(e.training.TrainingPage, {
    name: true,
    duration_: e.duration_to_seconds(section.is(e.training.TrainingPage).duration),
  }),
  ...e.is(e.training.Question, { type: true, answers: { id: true, content: true } }),
}));

@Injectable()
export class TrainingService {
  constructor(
    private readonly dbService: EdgeDBService,
    private readonly usersService: UsersService,
  ) {}

  async getTraining(id: string): Promise<training.Training> {
    try {
      return await this.dbService.query(
        e.assert_exists(
          e.select(e.training.Training, () => ({
            id: true,
            created_at: true,
            updated_at: true,
            name: true,
            description: true,
            locations: true,
            rep: {
              id: true,
              description: true,
            },
            compulsory: true,
            in_person: true,
            filter_single: { id },
          })),
        ),
      );
    } catch (e) {
      if (e instanceof CardinalityViolationError) {
        throw new NotFoundException(`Training with id ${id} not found`);
      }
      throw e;
    }
  }

  async searchTrainings(name: string) {
    const search = e.fts.search(e.training.Training, name);
    return await this.dbService.query(
      e.select(search.object, (training) => ({
        order_by: search.score,
        // @ts-ignore
        id: training.id,
        // @ts-ignore
        name: training.name,
      })),
    );
  }

  async getTrainings(location: training.Location): Promise<PartialTraining[]> {
    return await this.dbService.query(
      e.select(e.training.Training, (training) => ({
        id: true,
        name: true,
        description: true,
        compulsory: true,
        locations: true,
        created_at: true,
        updated_at: true,
        in_person: true,
        rep: {
          id: true,
          description: true,
        },
        filter: e.all(
          e.set(e.op(e.cast(TrainingLocation, location), "in", training.locations), e.op("exists", training.rep)),
        ),
      })),
    );
  }

  async trainingStatuses(location: training.Location, user_id: string | undefined) {
    if (user_id === undefined) {
      return await this.dbService.query(
        e.select(e.training.Training, (training) => ({
          filter: e.op(e.cast(TrainingLocation, location), "in", training.locations),
          id_: e.select(training.id),
          status: e.select("Complete"),
        })),
      );
    }
    const user = e.select(e.users.User, () => ({ filter_single: { id: user_id } }));
    const sessions = e.select(e.training.UserTrainingSession, (session) => ({
      filter: e.op(
        e.op(session.user, "=", user),
        "and",
        e.op(e.cast(TrainingLocation, location), "in", session.training.locations),
      ),
    }));
    const rest_of_training = e.select(e.training.Training, (training) => ({
      filter: e.op(
        e.op(e.cast(TrainingLocation, location), "in", training.locations),
        "and",
        e.op(training.id, "not in", sessions.training.id),
      ),
    }));

    return await this.dbService.query(
      e.select(e.op(rest_of_training, "union", sessions), (training_or_session) => {
        const training_status_selector = e.select(
          e.op(
            "Retake",
            "if",
            e.op(
              "exists",
              e.select(user.training, (training) => ({ filter: e.op(training, "=", training_or_session) })),
            ),
            "else",
            "Complete",
          ),
        );
        const session_training_id_selector = e.select(
          training_or_session.is(e.training.UserTrainingSession).training.id,
        );
        const is_training = e.op(training_or_session.__type__.name, "=", "training::Training");
        return {
          id_: e.select(
            e.op(e.select(training_or_session.id), "if", is_training, "else", session_training_id_selector),
          ),
          status: e.select(e.op(training_status_selector, "if", is_training, "else", e.select("Resume"))),
        };
      }),
    );
  }

  async startTraining(id: string, user_id: string) {
    const training = e.assert_exists(e.select(e.training.Training, () => ({ filter_single: { id } })));
    const user = e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id: user_id } })));
    try {
      return await this.dbService.query(
        e.select(
          e
            .insert(e.training.UserTrainingSession, {
              training,
              user: e.op(
                // check the user is a rep if they're doing rep training, otherwise insert invalid value (to raise)
                user,
                "if",
                e.op("exists", training.rep),
                "else",
                e.op(
                  user,
                  "if",
                  e.op(user.__type__.name, "=", "users::Rep"),
                  // poor mans e.op(user, "is", e.users.Rep)
                  "else",
                  e.cast(e.users.User, e.set()), // intentionally invalid value
                ),
              ),
            })
            // return the current session if the user has one
            .unlessConflict((session) => ({
              on: e.tuple([session.user, session.training]), // must be kept in-line with UserTrainingSession constraint
              else: session,
            })),
          (session: any) => ({
            id: true,
            sections: e.select(session.training.sections, (section: any) => ({
              filter: e.op(section.enabled, "and", e.op(section.index, "<=", session.index)),
              order_by: section.index,
              ...TrainingSection(section),
            })),
          }),
        ),
      );
    } catch (e) {
      if (e instanceof MissingRequiredError) {
        throw new BadRequestException({
          message: "You can't do rep training as a user",
          code: ErrorCodes.user_trying_to_complete_rep_training,
        });
      }
      throw e;
    }
  }

  async interactWithTraining(
    session_id: string,
    interaction_id: string,
    answers: { id: string }[] | undefined,
    user_id: string,
  ): Promise<training.InteractionResponse> {
    // TODO per-session locks to prevent funny things happening
    const session = await this.dbService.query(
      e.assert_exists(
        e.select(e.training.UserTrainingSession, (session) => ({
          training: true,
          index: true,
          filter_single: e.op(
            e.op(session.id, "=", e.uuid(session_id)),
            "and",
            e.op(session.user.id, "=", e.uuid(user_id)),
          ),
        })),
      ),
    );
    // validate the response
    const selector = e.shape(e.training.Interactable, (interactable) => ({
      filter_single: e.all(
        e.set(e.op(interactable.id, "=", e.uuid(interaction_id)), e.op(interactable.index, "=", session.index)),
      ),
    }));
    if (answers !== undefined) {
      const answer_ids = answers.map((answer) => answer.id);
      const question = e.assert_exists(e.select(e.training.Question, selector));
      let correct_answer_ids: string[];
      try {
        correct_answer_ids = await this.dbService.query(
          e.select(question.answers, (answer) => ({ filter: answer.correct })).id,
        );
      } catch (e) {
        if (e instanceof CardinalityViolationError) {
          throw new BadRequestException({
            message: `Question with ID ${interaction_id} not found.`,
            code: ErrorCodes.interactable_not_found,
          });
        }
        throw e;
      }

      if (
        answers.length !== correct_answer_ids.length ||
        !correct_answer_ids.every((answer) => answer_ids!.includes(answer))
      ) {
        return {
          type_name: "training::WrongAnswers",
          answers: answers.filter((answer) => !correct_answer_ids.includes(answer.id)),
        }; // TODO kick out?
      }
    } else {
      try {
        await this.dbService.query(e.assert_exists(e.select(e.training.TrainingPage, selector)));
      } catch (e) {
        if (e instanceof CardinalityViolationError) {
          throw new BadRequestException({
            message: `Training page with ID ${interaction_id} not found.`,
            code: ErrorCodes.interactable_not_found,
          });
        }
        throw e;
      }
    }
    const training = e.assert_exists(e.select(e.training.Training, () => ({ filter_single: session.training })));
    const next_section = await this.dbService.query(
      // might be useful to have as a compute at some point?
      e.assert_single(
        e.select(training.sections, (section) => ({
          filter: e.op(section.enabled, "and", e.op(section.index, ">", session.index)),
          order_by: section.index,
          limit: 1,
          ...TrainingSection(section),
        })),
      ),
    );

    if (next_section === null) {
      await this.dbService.query(
        e.update(e.users.User, (user) => ({
          filter_single: { id: user_id },
          set: {
            training: e.op(
              e.op(
                "distinct",
                e.for(user.training, (t) => {
                  // filter out the previous training if they had it
                  return e.op(training, "if", e.op(t, "!=", training), "else", e.cast(e.training.Training, e.set()));
                }),
              ),
              "union",
              e.delete(e.training.UserTrainingSession, () => ({
                filter_single: { id: session_id },
              })).training, // add it back in while atomically deleting the session
            ),
          },
        })),
      );

      return;
    }

    await this.dbService.query(
      e.update(e.training.UserTrainingSession, () => ({
        set: {
          index: next_section.index,
        },
        filter_single: { id: session_id },
      })),
    );

    return next_section as unknown as training.InteractionResponse;
  }
}
