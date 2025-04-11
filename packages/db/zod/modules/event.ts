import { Temporal } from "@js-temporal/polyfill";
import { Duration } from "gel";
import { z } from "zod";

// #region event::EventType
export const EventTypeSchema = z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]);
// #endregion

// #region event::Event
export const CreateEventSchema = z.
  object({ // default::CreatedAt
    created_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.string().datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // event::Event
    description: z.string().nullable(), // std::str
    ends_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.string().datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).nullable(), // std::datetime
    starts_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.string().datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]), // std::datetime
    title: z.string(), // std::str
    type: z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]), // event::EventType
  });

export const UpdateEventSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // event::Event
    description: z.string().nullable(), // std::str
    ends_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.string().datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).nullable(), // std::datetime
    starts_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.string().datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]), // std::datetime
    title: z.string(), // std::str
    type: z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]), // event::EventType
  });
// #endregion

        