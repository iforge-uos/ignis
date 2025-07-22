import { pub } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";

export const supervisingReps = pub
  .input(z.object({ name: LocationNameSchema }))
  .route({ path: "/supervising-reps" })
  .handler(async ({ input: { name }, context: { db } }) =>
    e
      .select(e.select(e.sign_in.Location, () => ({ filter_single: { name } })).supervising_reps, () => ({
        id: true,
        display_name: true,
        supervisable_training: true,
      }))
      .run(db),
  );
