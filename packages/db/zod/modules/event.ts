import * as z from "zod/v4";
import * as zt from "zod-temporal";


// #region event::Type
export const TypeSchema = z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]);
// #endregion

// #region event::Event
export const CreateEventSchema = z.
  object({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // event::Event
    ends_at: zt.zonedDateTime().nullable(), // std::datetime
    starts_at: zt.zonedDateTime(), // std::datetime
    type: z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]), // event::Type
    description: z.string(), // std::str
    name: z.string(), // std::str
  });

export const UpdateEventSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // event::Event
    ends_at: zt.zonedDateTime().nullable(), // std::datetime
    starts_at: zt.zonedDateTime(), // std::datetime
    type: z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]), // event::Type
    description: z.string(), // std::str
    name: z.string(), // std::str
  });
// #endregion
