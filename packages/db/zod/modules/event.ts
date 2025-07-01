import { z } from "zod/v4";

// #region event::Type
export const TypeSchema = z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]);
// #endregion

// #region event::Event
export const CreateEventSchema = z
  .object({
    // default::CreatedAt
    created_at: z.date().optional(), // std::datetime
  })
  .extend({
    // event::Event
    ends_at: z.date().nullable(), // std::datetime
    starts_at: z.date(), // std::datetime
    title: z.string(), // std::str
    type: z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]), // event::Type
    description: z.string(), // std::str
  });

export const UpdateEventSchema = z
  .object({
    // default::CreatedAt
  })
  .extend({
    // event::Event
    ends_at: z.date().nullable(), // std::datetime
    starts_at: z.date(), // std::datetime
    title: z.string(), // std::str
    type: z.enum(["WORKSHOP", "LECTURE", "MEETUP", "HACKATHON", "EXHIBITION", "WEBINAR"]), // event::Type
    description: z.string(), // std::str
  });
// #endregion
