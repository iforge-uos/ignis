import { pub } from "@/router";
import e from "@db/edgeql-js";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import { Duration } from "gel";
import { z } from "zod/v4";

export const remove = pub
  .route({ method: "PATCH", path: "/{id}", description: "Remove a user from the queue by the places ID" })
  .input(z.object({ name: LocationNameSchema, id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .update(e.sign_in.QueuePlace, () => ({
        filter_single: { id },
        set: {
          notified_at: e.op(e.datetime_of_statement(), "-", Duration.from({ minutes: 20 })),
        },
      }))
      .run(db),
  );
