import { eventsOrDeskOrAdmin, pub } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { idRouter } from "./$id";
import { CreateEventSchema } from "@packages/db/zod/modules/event";
import { search } from "./search";

export const all = pub
  .route({ method: "GET", path: "/" } )
  .handler(async ({ context: { db } }) =>
      e.select(e.event.Event, () => ({
        ...e.event.Event["*"]
      }))
      .run(db)
  );

export const create = eventsOrDeskOrAdmin
  .route({ method: "POST", path: "/" })
  .input(CreateEventSchema)
  .handler(async ({ input, context: { db } }) =>
    e
      .select(e.insert(e.event.Event, input), () => ({
        ...e.event.Event["*"],
      }))
      .run(db),
  );


export const eventsRouter = pub.prefix("/events").router({
  all,
  create,
  search,
  ...idRouter,
});
