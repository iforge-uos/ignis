import e from "@packages/db/edgeql-js";
import type { training } from "@packages/db/interfaces";
import * as z from "zod";
import { TrainingSectionShape } from "@/lib/utils/queries";
import { auth, transaction } from "@/orpc";

export interface PageInteraction extends Omit<training.Page, "duration" | "enabled" | "parent"> {
  __typename: "training::TrainingPage";
  duration: Temporal.Duration | null;
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
  .handler(async ({ input: { session_id, interaction_id, answers }, context: { tx, $user } }) => {
    // TODO per-session locks to prevent funny things happening
    const session = e.assert_exists(e.select(e.training.Session, () => ({ filter_single: { id: session_id } })));

    // validate the response
    const selector = e.shape(e.training.Interactable, () => ({
      filter_single: { id: interaction_id },
    }));
    if (answers) {
      // sets are ordered so we need to ensure they are sorted
      const correct_answers = e.select(e.assert_exists(e.select(e.training.Question, selector)).answers, (answer) => ({
        filter: answer.correct,
        order_by: answer.id,
      })).id;
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
      const { training: pre_existing } = e.select($user, () => ({
        training: {
          "@in_person_created_at": true,
          "@in_person_signed_off_by": true,
          "@infraction": true,
          filter_single: {
            id: session.training.id,
          },
        },
      })).run(tx);
      const temp = {
        "@created_at": e.datetime_of_statement(),
        "@in_person_created_at": pre_existing["@in_person_created_at"],
        "@in_person_signed_off_by": pre_existing["@in_person_signed_off_by"],
        "@infraction": pre_existing["@infraction"],
        filter_single: {
          id: session.training.id,
        },
      };

      await e
        .update($user, () => ({
          set: {
            training: {
              "+=": e.select(e.training.Training, () =>
                Object.keys(temp).forEach((key) => (temp as any)[key] === undefined && delete (temp as any)[key]),
              ),
            },
          },
        }))
        .run(tx);
      await e.delete(session).run(tx);
      return;
    }

    await e.update(session, () => ({ set: { index: next_section.index } })).run(tx);

    return next_section;
  });
