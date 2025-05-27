import { Temporal } from "@js-temporal/polyfill";
import { Duration } from "gel";
import { z } from "zod";

// #region event::Type
export const TypeSchema = z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]);
// #endregion

// #region event::Event
export const CreateEventSchema = z.
  object({ // default::CreatedAt
    created_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // event::Event
    ends_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).nullable(), // std::datetime
    starts_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]), // std::datetime
    title: z.string(), // std::str
    type: z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]), // event::Type
    description: z.string(), // std::str
  });

export const UpdateEventSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // event::Event
    ends_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).nullable(), // std::datetime
    starts_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]), // std::datetime
    title: z.string(), // std::str
    type: z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]), // event::Type
    description: z.string(), // std::str
  });
// #endregion

        