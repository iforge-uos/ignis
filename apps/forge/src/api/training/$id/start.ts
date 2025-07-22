import { TrainingSectionShape } from "@/lib/utils/queries";
import { auth } from "@/orpc";
import e from "@packages/db/edgeql-js";
import * as z from "zod";

export const start = auth
  .route({ path: "/start" })
  .input(
    z.object({
      id: z.uuid(),
    }),
  )
  .handler(async ({ input: { id }, context: { db, $user } }) => {
    const session = await e
      .select(
        e
          .insert(e.training.Session, {
            training: e.select(e.training.Training, () => ({ filter_single: { id } })),
            user: $user,
          })
          // return the current session if the user has one
          // must be kept in-line with Session constraint
          .unlessConflict((session) => ({ on: e.tuple([session.training, session.user]), else: session })),
        (session) => ({
          id: true,
          sections: e.select(session.training.sections, (section) => ({
            ...TrainingSectionShape(section),
            filter: e.op(section.enabled, "and", e.op(section.index, "<=", section.index)),
            order_by: section.index,
          })),
        }),
      )
      .run(db);
    return session as Omit<typeof session, "sections"> & {
      sections: Extract<(typeof session.sections)[number], { __typename: "training::Page" | "training::Question" }>[];
    };
  });
