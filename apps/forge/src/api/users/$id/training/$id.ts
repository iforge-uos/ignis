import { rep, transaction } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { addInPersonTraining } from "@packages/db/queries/addInPersonTraining.query";
import * as z from "zod";

export const createInPerson = rep
  .route({ method: "POST", path: "/{training_id}" })
  .input(
    z.object({
      id: z.uuid(),
      training_id: z.uuid(),
      created_at: z.date(),
      rep_id: z.uuid(),
    }),
  )
  .handler(async ({ input: { id, training_id, ...data }, context: { db } }) =>
    addInPersonTraining(db, {
      id,
      training_id,
      ...data,
    }),
  );

export const remove = rep
  .route({ method: "DELETE", path: "/{training_id}" })
  .input(
    z.object({
      id: z.uuid(),
      training_id: z.uuid(),
      reason: z.string().min(1),
    }),
  )
  .output(z.void())
  .use(transaction)
  .handler(async ({ input: { id, training_id, reason }, context: { tx } }) => {
    const user = e.assert_exists(
      e.select(e.users.User, () => ({
        filter_single: { id },
      })),
    );

    await e
      .update(user, () => ({
        set: {
          training: e.op(
            e.assert_exists(
              e.select(user.training, () => ({
                filter_single: { id: training_id },
                "@infraction": e.insert(e.users.Infraction, {
                  user,
                  reason,
                  resolved: true,
                  type: e.users.InfractionType.TRAINING_ISSUE,
                }),
              })),
            ),
            "union",
            e.select(user.training, (t) => ({
              filter: e.op(t.id, "!=", training_id),
            })),
          ),
        },
      }))
      .run(tx);

    await e
      .delete(e.training.Session, (session) => ({
        filter_single: e.all(e.set(e.op(session.training.id, "=", e.uuid(training_id)), e.op(session.user, "=", user))),
      }))
      .run(tx);
  });
