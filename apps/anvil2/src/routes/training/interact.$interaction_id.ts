import { auth, transaction } from "@/router";
import e from "@db/edgeql-js";
import type { training } from "@db/interfaces";
import { getTrainingNextSection } from "@db/queries/getTrainingNextSection.query";
import { Temporal } from "@js-temporal/polyfill";
import { Duration } from "gel";
import { z } from "zod/v4";

export interface PageInteraction extends Omit<training.Page, "duration"> {
  type_name: "training::TrainingPage";
  duration?: Temporal.Duration | Duration; // duration in seconds as a float (but yes it really is a string)
}
export interface QuestionInteraction extends Omit<training.Question, "answers"> {
  type_name: "training::Question";
  answers: { id: string; content: string; description?: string }[];
}
export type WrongAnswers = {
  type_name: "training::WrongAnswers";
  // answers: { id: string }[];
};

export type InteractionResponse = PageInteraction | QuestionInteraction | WrongAnswers | undefined;

export const interact = auth
  .route({ path: "/interact/{interaction_id}" })
  .use(transaction)
  .input(
    z.object({
      session_id: z.uuid(),
      interaction_id: z.uuid(),
      answers: z.array(z.object({ id: z.uuid() })).nullable(),
    }),
  )
  .handler(
    async ({ input: { session_id, interaction_id, answers }, context: { tx } }): Promise<InteractionResponse> => {
      // TODO per-session locks to prevent funny things happening
      const session = await e
        .assert_exists(
          e.select(e.training.Session, (session) => ({
            training: true,
            index: true,
            filter_single: e.op(e.op(session.id, "=", e.uuid(session_id)), "and", e.op(session.user, "=", e.user)),
          })),
        )
        .run(tx);
      // validate the response
      const selector = e.shape(e.training.Interactable, (interactable) => ({
        filter_single: e.all(
          e.set(e.op(interactable.id, "=", e.uuid(interaction_id)), e.op(interactable.index, "=", session.index)),
        ),
      }));
      if (answers) {
        // sets are ordered so we need to ensure they are sorted
        const correct_answers = e.select(
          e.assert_exists(e.select(e.training.Question, selector)).answers,
          (answer) => ({
            filter: answer.correct,
            order_by: answer.id,
          }),
        ).id;
        const their_answers = e.select(e.cast(e.uuid, e.set(...answers.map((answer) => answer.id))), (id) => ({
          order_by: id,
        }));

        // eq on a normal set is element-wise, need casting to an array
        if (await e.op(e.array_agg(their_answers), "!=", e.array_agg(correct_answers)).run(tx)) {
          return {
            type_name: "training::WrongAnswers",
          }; // TODO kick out?
        }
      } else {
        await e.assert_exists(e.select(e.training.Page, selector)).run(tx);
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
      const next_section = await getTrainingNextSection(tx, {
        // NOTE edgedb stopped working for these queries idk why
        id: session.training.id,
        session_index: session.index,
      });

      if (next_section === null) {
        await e
          .update(e.user, (user) => ({
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
          }))
          .run(tx);

        return;
      }

      await e
        .update(e.training.Session, () => ({
          set: {
            index: next_section.index,
          },
          filter_single: { id: session_id },
        }))
        .run(tx);

      return next_section as InteractionResponse;
    },
  );
