import { auth } from "@/router";
import { TrainingShape } from "@/utils/queries";
import e from "@db/edgeql-js";
import { z } from "zod";
import { createInPerson, remove } from "./$id";
import { inPersonRemaining } from "./in-person.$location";

export const all = auth
  .meta({ path: "/" })
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input: { id }, context: { db } }) => {
    const { training } = await e
      .assert_exists(
        e.select(e.users.User, () => ({
          training: (training) => ({
            ...TrainingShape(training),
            rep: { id: true, description: true },
          }),
          filter_single: { id },
        })),
      )
      .run(db);

    return training;
  });

export const trainingRouter = auth.prefix("/training").router({
  all,
  createInPerson,
  remove,
  inPersonRemaining,
});
