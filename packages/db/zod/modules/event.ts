import * as z from "zod";
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
    type: z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]), // event::Type
    ends_at: zt.zonedDateTime().nullable(), // std::datetime
    starts_at: zt.zonedDateTime(), // std::datetime
    title: z.string(), // std::str
    description: z.string(), // std::str
  });

export const UpdateEventSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // event::Event
    type: z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]), // event::Type
    ends_at: zt.zonedDateTime().nullable(), // std::datetime
    starts_at: zt.zonedDateTime(), // std::datetime
    title: z.string(), // std::str
    description: z.string(), // std::str
  });
// #endregion
