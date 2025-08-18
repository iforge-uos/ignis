import { auth, eventsOrDeskOrAdmin, pub, rep } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { z } from "zod";
import { CreateEventSchema, UpdateEventSchema } from "@packages/db/zod/modules/event";

export const get = pub
  .route({ method: "GET", path: "/" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .assert_exists(
        e.select(e.event.Event, () => ({
          filter_single: { id },
          ...e.event.Event["*"],
        })),
      )
      .run(db),
  );

export const update = eventsOrDeskOrAdmin
  .route({ method: "PATCH", path: "/" })
  .input(UpdateEventSchema.extend({id: z.uuid()}))
  .handler(async ({ input: { id, ...rest }, context: { db } }) =>
    e
      .select(
        e.assert_exists(
          e.update(e.event.Event, () => ({
            filter_single: { id },
            set: rest,
          })),
        ),
      )
      .run(db),
  );

export const idRouter = auth.prefix("/{id}").router({
  get,
  update,
});
