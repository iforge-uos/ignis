import { EdgeDBService } from "@/edgedb/edgedb.service";
import { ErrorCodes } from "@/shared/constants/ErrorCodes";
import { UsersService } from "@/users/users.service";
import { LocationNameSchema } from "@dbschema/edgedb-zod/modules/training";
import e from "@dbschema/edgeql-js";
import { LocationName } from "@dbschema/edgeql-js/modules/training";
import { getTrainingForEditing } from "@dbschema/queries/getTrainingForEditing.query";
import { getTrainingNextSection } from "@dbschema/queries/getTrainingNextSection.query";
import { startTraining } from "@dbschema/queries/startTraining.query";
import { training } from "@ignis/types";
import { AllTraining, PartialTraining } from "@ignis/types/training";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CardinalityViolationError, InvalidValueError, MissingRequiredError } from "edgedb";

export const LOCATIONS = Object.keys(LocationNameSchema.Values) as readonly training.LocationName[];

const TrainingSection = e.shape(e.training.Training.sections, (section) => ({
  type_name: e.select(section.__type__.name),
  id: true,
  content: true,
  index: true,
  ...e.is(e.training.Page, {
    name: true,
    duration_: e.duration_to_seconds(section.is(e.training.Page).duration),
  }),
  ...e.is(e.training.Question, {
    answers: { id: true, content: true },
  }),
}));

@Injectable()
export class TrainingService {
  constructor(
    private readonly dbService: EdgeDBService,
    private readonly usersService: UsersService,
  ) {}

  async getTraining(id: string, editing?: boolean, rep_id?: string): Promise<training.Training> {
    const fn = editing
      ? () => getTrainingForEditing(this.dbService.client, { id }) as Promise<training.Training>
      : () =>
          this.dbService.query(
            e.assert_exists(
              e.select(e.training.Training, () => ({
                id: true,
                created_at: true,
                updated_at: true,
                name: true,
                description: true,
                locations: true,
                compulsory: true,
                in_person: true,
                enabled: true,
                rep: {
                  id: true,
                  name: true,
                  description: true,
                },
                icon_url: true,
                filter_single: { id },
              })),
            ),
          );

    let training: training.Training;
    try {
      training = await fn();
    } catch (error) {
      if (error instanceof InvalidValueError || error instanceof CardinalityViolationError) {
        throw new NotFoundException(`Training with id ${id} not found`, {
          cause: error.toString(),
        });
      }
      throw error;
    }

    // you only have editing if you're an H&S/admin anyway
    if (training.rep || editing) {
      return training;
    }

    if (training.id && rep_id) {
      const doneUserTraining = await this.dbService.query(
        e.op(
          e.uuid(training.id),
          "in",
          e.select(e.users.Rep, () => ({ filter_single: { id: rep_id } })).training.rep.id,
        ),
      );
      if (!doneUserTraining) {
        throw new ForbiddenException(`Cannot access rep training ${rep_id} without performing user training first`);
      }
    }
    return training;

    // try {
    //   return await this.dbService.query(
    //     e.assert_exists(
    //       e.select(e.training.Training, () => ({
    //         ...(editing
    //           ? {
    //               ...e.training.Training["*"],
    //               sections: TrainingSection,
    //             }
    //           : {
    //               id: true,
    //               created_at: true,
    //               updated_at: true,
    //               name: true,
    //               description: true,
    //               locations: true,
    //               compulsory: true,
    //               in_person: true,
    //             }),
    //         enabled: true,
    //         rep: { id: true, name: true, description: true },
    //         filter_single: { id },
    //       })),
    //     ),
    //   );
    // } catch (e) {
    //   if (e instanceof CardinalityViolationError) {
    //     throw new NotFoundException(`Training with id ${id} not found`);
    //   }
    //   throw e;
    // }
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

  async getAllTrainings(): Promise<AllTraining[]> {
    const all = await this.dbService.query(
      e.select(e.training.Training, (training) => ({
        id: true,
        name: true,
        description: true,
        locations: true,
        rep: {
          id: true,
          description: true,
        },
        filter: e.all(e.set(e.op("exists", training.rep), training.enabled)),
        order_by: training.name,
      })),
    );

    return all.sort((a, b) => a.name.localeCompare(b.name)) as AllTraining[];
  }

  async getTrainings(location: training.LocationName): Promise<PartialTraining[]> {
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
        icon_url: true,
        enabled: true,
        filter: e.all(
          e.set(
            e.op(e.cast(LocationName, location), "in", training.locations),
            e.op("exists", training.rep),
            training.enabled,
          ),
        ),
      })),
    );
  }

  async trainingStatuses(location: training.LocationName, user_id: string | undefined) {
    if (user_id === undefined) {
      return await this.dbService.query(
        e.select(e.training.Training, (training) => ({
          filter: e.op(e.cast(LocationName, location), "in", training.locations),
          id_: e.select(training.id),
          status: e.select("Start"),
        })),
      );
    }
    const user = e.select(e.users.User, () => ({ filter_single: { id: user_id } }));
    const sessions = e.select(e.training.Session, (session) => ({
      filter: e.op(
        e.op(session.user, "=", user),
        "and",
        e.op(e.cast(LocationName, location), "in", session.training.locations),
      ),
    }));
    const rest_of_training = e.select(e.training.Training, (training) => ({
      filter: e.op(
        // FIXME this doesnt work in the HS
        e.op(
          e.op(e.cast(LocationName, location), "in", training.locations),
          "if",
          e.op("exists", training.rep), // forward all rep trainings no-matter the location
          "else",
          true,
        ),
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
            "Start",
          ),
        );
        const session_training_id_selector = e.select(training_or_session.is(e.training.Session).training.id);
        const is_training = e.op(training_or_session.__type__.name, "=", "training::Page");
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
    try {
      return await startTraining(this.dbService.client, { id, user_id });
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
        e.select(e.training.Session, (session) => ({
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
        await this.dbService.query(e.assert_exists(e.select(e.training.Page, selector)));
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
    // const next_section = await this.dbService.query(
    //   // might be useful to have as a compute at some point?
    //   e.assert_single(
    //     e.select(training.sections, (section) => ({
    //       filter: e.op(section.enabled, "and", e.op(section.index, ">", session.index)),
    //       order_by: section.index,
    //       limit: 1,
    //       ...TrainingSection(section),
    //     })),
    //   ),
    // );
    const next_section = await getTrainingNextSection(this.dbService.client, {
      // NOTE edgedb stopped working for these queries idk why
      id: session.training.id,
      session_index: session.index,
    });

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
                  return e.op(t, "if", e.op(t, "!=", training), "else", e.cast(e.training.Training, e.set()));
                }),
              ),
              "union",
              e.delete(e.training.Session, () => ({
                filter_single: { id: session_id },
              })).training, // add it back in while atomically deleting the session
            ),
          },
        })),
      );

      return;
    }

    await this.dbService.query(
      e.update(e.training.Session, () => ({
        set: {
          index: next_section.index,
        },
        filter_single: { id: session_id },
      })),
    );

    return next_section as unknown as training.InteractionResponse;
  }
}
