import { z } from "zod/v4";

// #region tools::Status
export const StatusSchema = z.enum(["NOMINAL", "IN_USE", "OUT_OF_ORDER"]);
// #endregion

// #region tools::Booking
export const CreateBookingSchema = z
  .object({
    // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
    created_at: z.date().optional(), // std::datetime
  })
  .extend({
    // tools::Booking
    ends_at: z.date(), // std::datetime
    starts_at: z.date(), // std::datetime
    cancelled: z.boolean().nullable(), // std::bool
  });

export const UpdateBookingSchema = z
  .object({
    // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
  })
  .extend({
    // tools::Booking
    ends_at: z.date(), // std::datetime
    starts_at: z.date(), // std::datetime
    cancelled: z.boolean().nullable(), // std::bool
  });
// #endregion

// #region tools::Tool
export const CreateToolSchema = z.object({
  is_bookable: z.boolean(), // std::bool
  status: z.enum(["NOMINAL", "IN_USE", "OUT_OF_ORDER"]), // tools::Status
  min_booking_time: z.iso.duration().optional().nullable(), // std::duration
  max_booking_daily: z.iso.duration().nullable(), // std::duration
  max_booking_weekly: z.iso.duration().nullable(), // std::duration
  name: z.string(), // std::str
  quantity: z.number().int().min(-32768).max(32767), // std::int16
});

export const UpdateToolSchema = z.object({
  is_bookable: z.boolean(), // std::bool
  status: z.enum(["NOMINAL", "IN_USE", "OUT_OF_ORDER"]), // tools::Status
  min_booking_time: z.iso.duration().optional().nullable(), // std::duration
  max_booking_daily: z.iso.duration().nullable(), // std::duration
  max_booking_weekly: z.iso.duration().nullable(), // std::duration
  name: z.string(), // std::str
  quantity: z.number().int().min(-32768).max(32767), // std::int16
});
// #endregion
