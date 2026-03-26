import { Temporal } from "@js-temporal/polyfill";
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
  const now = Temporal.Now.zonedDateTimeISO("Europe/London");
  const startOfMonth = now.with({ day: 1, hour: 0, minute: 0, second: 0 }).subtract({ months: 2 });
  const calendarIds = env.google?.calendarIds ?? [];
  const items = await Promise.all(
    calendarIds.map(async (calendarId) => {
      const {
        data: { items },
      } = await calendar.events.list({
        calendarId,
        timeMin: new Date(startOfMonth.epochMilliseconds).toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: "startTime",
      });
      return (
        items?.flatMap((event): IEvent[] => {
          const startDate = event.start?.dateTime ?? (event.start?.date ? `${event.start.date}T00:00:00.000Z` : undefined);
          if (!startDate) {
            return [];
          }

          const endDate = event.end?.dateTime ?? (event.end?.date ? `${event.end.date}T00:00:00.000Z` : startDate);

          return [
            {
              id: event.id ?? `${calendarId}-${startDate}`,
              location: event.location ?? "",
              startDate,
              endDate,
              title: event.summary!,
              color: "blue",
              description: event.description ?? "",
              user: { id: "0", name: "Events", picturePath: "/favicon.svg" },
            },
          ];
        }) || []
      );
    }),
  );
  return items.flat();
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
