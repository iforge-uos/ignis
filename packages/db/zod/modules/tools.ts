import * as z from "zod/v4";
import * as zt from "zod-temporal";


// #region tools::Status
export const StatusSchema = z.enum(["NOMINAL", "IN_USE", "OUT_OF_ORDER"]);
// #endregion

// #region tools::Booking
export const CreateBookingSchema = z.
  object({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // tools::Booking
    ends_at: zt.zonedDateTime(), // std::datetime
    starts_at: zt.zonedDateTime(), // std::datetime
    cancelled: z.boolean().nullable(), // std::bool
  });

export const UpdateBookingSchema = z.
  object({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
  })
  .extend({ // tools::Booking
    ends_at: zt.zonedDateTime(), // std::datetime
    starts_at: zt.zonedDateTime(), // std::datetime
    cancelled: z.boolean().nullable(), // std::bool
  });
// #endregion

// #region tools::Tool
export const CreateToolSchema = z.
  object({
    is_bookable: z.boolean(), // std::bool
    status: z.enum(["NOMINAL", "IN_USE", "OUT_OF_ORDER"]), // tools::Status
    min_booking_time: zt.duration().optional().nullable(), // std::duration
    borrowable: z.boolean(), // std::bool
    description: z.string(), // std::str
    max_booking_daily: zt.duration().nullable(), // std::duration
    max_booking_weekly: zt.duration().nullable(), // std::duration
    name: z.string(), // std::str
    quantity: z.int().min(-32768).max(32767), // std::int16
  });

export const UpdateToolSchema = z.
  object({
    is_bookable: z.boolean(), // std::bool
    status: z.enum(["NOMINAL", "IN_USE", "OUT_OF_ORDER"]), // tools::Status
    min_booking_time: zt.duration().optional().nullable(), // std::duration
    borrowable: z.boolean(), // std::bool
    description: z.string(), // std::str
    max_booking_daily: zt.duration().nullable(), // std::duration
    max_booking_weekly: zt.duration().nullable(), // std::duration
    name: z.string(), // std::str
    quantity: z.int().min(-32768).max(32767), // std::int16
  });
// #endregion
