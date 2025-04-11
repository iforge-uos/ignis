import { pub } from "@/router";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import e from "@db/edgeql-js";
import { z } from "zod";

// @IdempotencyCache(60)
export const remove = pub
  .route({ method: "DELETE", path: "/{id}" })
  .input(z.object({ name: LocationNameSchema, id: z.string().uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .delete(e.sign_in.QueuePlace, () => ({
        filter_single: { id },
      }))
      .run(db),
  );
