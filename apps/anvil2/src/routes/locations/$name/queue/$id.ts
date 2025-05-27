import { pub } from "@/router";
import e from "@db/edgeql-js";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import { Duration } from "gel";
import { z } from "zod/v4";

// @IdempotencyCache(60)
export const remove = pub
  .route({ method: "DELETE", path: "/{id}" })
  .input(z.object({ name: LocationNameSchema, id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .delete(e.sign_in.QueuePlace, () => ({
        filter_single: { id },
      }))
      .run(db),
  );
