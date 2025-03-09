import { z } from "zod";

// #region event::EventType
export const EventTypeSchema = z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]);
// #endregion

// #region event::Event
export const CreateEventSchema = z.
  object({ // default::CreatedAt
    created_at: z.string().datetime({ offset: true }).optional(), // std::datetime
  })
  .extend({ // event::Event
    description: z.string().optional(), // std::str
    ends_at: z.string().datetime({ offset: true }).optional(), // std::datetime
    starts_at: z.string().datetime({ offset: true }), // std::datetime
    title: z.string(), // std::str
    type: z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]), // event::EventType
  });

export const UpdateEventSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // event::Event
    description: z.string().optional(), // std::str
    ends_at: z.string().datetime({ offset: true }).optional(), // std::datetime
    starts_at: z.string().datetime({ offset: true }), // std::datetime
    title: z.string(), // std::str
    type: z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]), // event::EventType
  });
// #endregion
