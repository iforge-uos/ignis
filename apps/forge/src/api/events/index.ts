import e from "@packages/db/edgeql-js";
import { CreateEventSchema } from "@packages/db/zod/modules/event";
import { IEvent } from "@packages/ui/calendar/interfaces.d";
import { calendar } from "@/google";
import env from "@/lib/env";
import { eventsOrDeskOrAdmin, pub } from "@/orpc";
import { idRouter } from "./$id";
import { search } from "./search";

export const all = pub.route({ method: "GET", path: "/" }).handler(async ({ context: { db } }) =>
  e
    .select(e.event.Event, () => ({
      ...e.event.Event["*"],
    }))
    .run(db),
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

export const upcoming = pub.route({ method: "GET", path: "/upcoming" }).handler(async () => {
  const {
    data: { items },
  } = await calendar.events.list({
    calendarId: env.google.EVENTS_CALENDAR,
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  return (
    items?.map((event): IEvent => {
      return {
        id: event.id!,
        location: event.location!,
        startDate: event.start?.dateTime!,
        endDate: event.end?.dateTime!,
        title: event.summary!,
        color: "blue",
        description: event.description!,
        user: { id: "0", name: "Events", picturePath: "/favicon.svg" },
      };
    }) || []
  );
});

// export const photos = () =>
// https://github.com/Brokerloop/ttlcache
// https://github.com/drawrowfly/instagram-scraper

export const eventsRouter = pub.prefix("/events").router({
  all,
  create,
  search,
  upcoming,
  ...idRouter,
});
