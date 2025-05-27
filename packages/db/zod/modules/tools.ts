import { Temporal } from "@js-temporal/polyfill";
import { Duration } from "gel";
import { z } from "zod";

// #region tools::Status
export const StatusSchema = z.enum(["NOMINAL", "IN_USE", "OUT_OF_ORDER"]);
// #endregion

// #region tools::Booking
export const CreateBookingSchema = z.
  object({ // default::Auditable
    updated_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
    created_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // tools::Booking
    ends_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]), // std::datetime
    starts_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]), // std::datetime
    cancelled: z.boolean().nullable(), // std::bool
  });

export const UpdateBookingSchema = z.
  object({ // default::Auditable
    updated_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
  })
  .extend({ // tools::Booking
    ends_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]), // std::datetime
    starts_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]), // std::datetime
    cancelled: z.boolean().nullable(), // std::bool
  });
// #endregion

// #region tools::Tool
export const CreateToolSchema = z.
  object({
    is_bookable: z.boolean(), // std::bool
    status: z.enum(["NOMINAL", "IN_USE", "OUT_OF_ORDER"]), // tools::Status
    min_booking_time: z.union([z.instanceof(Temporal.Duration), z.instanceof(Duration).transform(Temporal.Duration.from), (z.iso.duration().transform((dur) => Temporal.Duration.from(dur)))]).optional().nullable(), // std::duration
    max_booking_daily: z.union([z.instanceof(Temporal.Duration), z.instanceof(Duration).transform(Temporal.Duration.from), (z.iso.duration().transform((dur) => Temporal.Duration.from(dur)))]).nullable(), // std::duration
    max_booking_weekly: z.union([z.instanceof(Temporal.Duration), z.instanceof(Duration).transform(Temporal.Duration.from), (z.iso.duration().transform((dur) => Temporal.Duration.from(dur)))]).nullable(), // std::duration
    name: z.string(), // std::str
  });

export const UpdateToolSchema = z.
  object({
    is_bookable: z.boolean(), // std::bool
    status: z.enum(["NOMINAL", "IN_USE", "OUT_OF_ORDER"]), // tools::Status
    min_booking_time: z.union([z.instanceof(Temporal.Duration), z.instanceof(Duration).transform(Temporal.Duration.from), (z.iso.duration().transform((dur) => Temporal.Duration.from(dur)))]).optional().nullable(), // std::duration
    max_booking_daily: z.union([z.instanceof(Temporal.Duration), z.instanceof(Duration).transform(Temporal.Duration.from), (z.iso.duration().transform((dur) => Temporal.Duration.from(dur)))]).nullable(), // std::duration
    max_booking_weekly: z.union([z.instanceof(Temporal.Duration), z.instanceof(Duration).transform(Temporal.Duration.from), (z.iso.duration().transform((dur) => Temporal.Duration.from(dur)))]).nullable(), // std::duration
    name: z.string(), // std::str
  });
// #endregion

        