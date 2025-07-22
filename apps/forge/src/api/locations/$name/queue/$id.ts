import { pub } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { Duration } from "gel";
import * as z from "zod";

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
