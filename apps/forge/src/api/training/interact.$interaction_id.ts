import { TrainingSectionShape } from "@/lib/utils/queries";
import { auth, transaction } from "@/orpc";
import e from "@packages/db/edgeql-js";
import type { training } from "@packages/db/interfaces";
import { Duration } from "gel";
import * as z from "zod/v4";

export interface PageInteraction extends Omit<training.Page, "duration" | "enabled" | "parent"> {
  __typename: "training::Page";
  duration: Duration | null;
}
export interface QuestionInteraction extends Omit<training.Question, "answers" | "enabled" | "parent"> {
  __typename: "training::Question";
  answers: { id: string; content: string; description?: string }[];
}
export type WrongAnswers = {
  __typename: "training::WrongAnswers";
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
      answers: z.array(z.object({ id: z.uuid() })).optional(),
    }),
  )
  .handler(
    async ({ input: { session_id, interaction_id, answers }, context: { tx } }): Promise<InteractionResponse> => {
      // TODO per-session locks to prevent funny things happening
      const session = e.assert_exists(
        e.select(e.training.Session, (session) => ({
          training: true,
          index: true,
          filter_single: e.op(e.op(session.id, "=", e.uuid(session_id)), "and", e.op(session.user, "=", e.user)),
        })),
      );

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

        // comparing in gel so we can potentially add stat tracking down the line easier
        // eq on a normal set is element-wise, need casting to an array
        if (await e.op(e.array_agg(their_answers), "!=", e.array_agg(correct_answers)).run(tx)) {
          return {
            __typename: "training::WrongAnswers",
          }; // TODO kick out?


        }
      } else {
        await e.assert_exists(e.select(e.training.Page, selector)).run(tx);
      }

      const next_section = await e.assert_single(e.select(session.next_section, TrainingSectionShape)).run(tx);

      if (next_section === null) {
        await e
          .update(e.user, (user) => ({
            set: {
              training: e.op(
                e.op(
                  "distinct",
                  e.for(user.training, (t) => {
                    // filter out the previous training if they had it
                    return e.op(t, "if", e.op(t, "!=", session.training), "else", e.cast(e.training.Training, e.set()));
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

      await e.update(session, () => ({ set: { index: next_section.index } })).run(tx);

      return next_section as Extract<typeof next_section, { __typename: "training::Page" | "training::Question" }>; // lol this is so bugged, will be fixed by the issue in the schema when I can rename
    },
  );
