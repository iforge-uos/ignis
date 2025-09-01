import { TrainingShape } from "@/lib/utils/queries";
import { auth } from "@/orpc";
import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { createInPerson, remove } from "./$id";
import { inPersonRemaining } from "./in-person.$location";

export const all = auth
  .meta({ path: "/" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input, context: { db } }) =>
    e
      .assert_exists(e.select(e.users.User, () => ({ training: TrainingShape, filter_single: input })))
      .run(db)
      .then(({ training }) => training),
  );

export const trainingRouter = auth.prefix("/training").router({
  all,
  createInPerson,
  remove,
  inPersonRemaining,
});
