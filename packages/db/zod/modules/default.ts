import { z } from "zod/v4";

// #region default::Auditable
export const CreateAuditableSchema = z
  .object({
    // default::CreatedAt
    created_at: z.date().optional(), // std::datetime
  })
  .extend({
    // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  });

export const UpdateAuditableSchema = z
  .object({
    // default::CreatedAt
  })
  .extend({
    // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  });
// #endregion

// #region default::CreatedAt
export const CreateCreatedAtSchema = z.object({
  created_at: z.date().optional(), // std::datetime
});

export const UpdateCreatedAtSchema = z.object({});
// #endregion

// #region default::Timed
export const CreateTimedSchema = z
  .object({
    // default::CreatedAt
    created_at: z.date().optional(), // std::datetime
  })
  .extend({
    // default::Timed
    ends_at: z.date().nullable(), // std::datetime
  });

export const UpdateTimedSchema = z
  .object({
    // default::CreatedAt
  })
  .extend({
    // default::Timed
    ends_at: z.date().nullable(), // std::datetime
  });
// #endregion

// #region default::user
export const CreateuserSchema = z
  .object({
    // users::User
    first_name: z.string(), // std::str
    last_name: z.string().nullable(), // std::str
    display_name: z.string().optional(), // std::str
    email: z.string().regex(/[\w\-\.]+/), // std::str
    organisational_unit: z.string(), // std::str
    profile_picture: z.string().nullable(), // std::str
    pronouns: z.string().nullable(), // std::str
    ucard_number: z.number().int().min(-2147483648).max(2147483647), // std::int32
    username: z.string(), // std::str
  })
  .extend({
    // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
    created_at: z.date().optional(), // std::datetime
  })
  .extend({
    // default::user
  });

export const UpdateuserSchema = z
  .object({
    // users::User
    first_name: z.string(), // std::str
    last_name: z.string().nullable(), // std::str
    display_name: z.string().optional(), // std::str
    email: z.string().regex(/[\w\-\.]+/), // std::str
    organisational_unit: z.string(), // std::str
    profile_picture: z.string().nullable(), // std::str
    pronouns: z.string().nullable(), // std::str
    ucard_number: z.number().int().min(-2147483648).max(2147483647), // std::int32
    username: z.string(), // std::str
  })
  .extend({
    // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
  })
  .extend({
    // default::user
  });
// #endregion
