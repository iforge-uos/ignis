import { z } from "zod";

// #region users::InfractionType
export const InfractionTypeSchema = z.enum(["WARNING", "TEMP_BAN", "PERM_BAN", "RESTRICTION", "TRAINING_ISSUE"]);
// #endregion

// #region users::Platform
export const PlatformSchema = z.enum(["DISCORD", "GITHUB"]);
// #endregion

// #region users::RepStatus
export const RepStatusSchema = z.enum(["ACTIVE", "BREAK", "ALUMNI", "FUTURE", "REMOVED"]);
// #endregion

// #region users::Infraction
export const CreateInfractionSchema = z.
  object({ // default::CreatedAt
    created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // users::Infraction
    duration: z.never().optional(), // std::duration
    reason: z.string(), // std::str
    resolved: z.boolean().optional(), // std::bool
    type: z.enum(["WARNING", "TEMP_BAN", "PERM_BAN", "RESTRICTION", "TRAINING_ISSUE"]), // users::InfractionType
  });

export const UpdateInfractionSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // users::Infraction
    duration: z.never().optional(), // std::duration
    reason: z.string(), // std::str
    resolved: z.boolean().optional(), // std::bool
    type: z.enum(["WARNING", "TEMP_BAN", "PERM_BAN", "RESTRICTION", "TRAINING_ISSUE"]), // users::InfractionType
  });
// #endregion

// #region users::Integration
export const CreateIntegrationSchema = z.
  object({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // users::Integration
    external_id: z.string(), // std::str
    platform: z.enum(["DISCORD", "GITHUB"]), // users::Platform
    external_email: z.string(), // std::str
  });

export const UpdateIntegrationSchema = z.
  object({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // users::Integration
    external_id: z.string(), // std::str
    platform: z.enum(["DISCORD", "GITHUB"]), // users::Platform
    external_email: z.string(), // std::str
  });
// #endregion

// #region users::Rep
export const CreateRepSchema = z.
  object({ // users::User
    first_name: z.string(), // std::str
    last_name: z.string().optional(), // std::str
    display_name: z.string().optional(), // std::str
    email: z.string().regex(/[\w\-\.]+/), // std::str
    organisational_unit: z.string(), // std::str
    profile_picture: z.string().optional(), // std::str
    pronouns: z.string().optional(), // std::str
    ucard_number: z.number().int().min(0).max(2147483647), // std::int32
    username: z.string(), // std::str
  })
  .extend({ // users::Rep
    status: z.enum(["ACTIVE", "BREAK", "ALUMNI", "FUTURE", "REMOVED"]).optional(), // users::RepStatus
  });

export const UpdateRepSchema = z.
  object({ // users::User
    first_name: z.string(), // std::str
    last_name: z.string().optional(), // std::str
    display_name: z.string().optional(), // std::str
    email: z.string().regex(/[\w\-\.]+/), // std::str
    organisational_unit: z.string(), // std::str
    profile_picture: z.string().optional(), // std::str
    pronouns: z.string().optional(), // std::str
    ucard_number: z.number().int().min(0).max(2147483647), // std::int32
    username: z.string(), // std::str
  })
  .extend({ // users::Rep
    status: z.enum(["ACTIVE", "BREAK", "ALUMNI", "FUTURE", "REMOVED"]).optional(), // users::RepStatus
  });
// #endregion

// #region users::SettingTemplate
export const CreateSettingTemplateSchema = z.
  object({
    key: z.string(), // std::str
    default_value: z.string(), // std::str
  });

export const UpdateSettingTemplateSchema = z.
  object({
    key: z.string(), // std::str
    default_value: z.string(), // std::str
  });
// #endregion

// #region users::User
export const CreateUserSchema = z.
  object({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // users::User
    first_name: z.string(), // std::str
    last_name: z.string().optional(), // std::str
    display_name: z.string().optional(), // std::str
    email: z.string().regex(/[\w\-\.]+/), // std::str
    organisational_unit: z.string(), // std::str
    profile_picture: z.string().optional(), // std::str
    pronouns: z.string().optional(), // std::str
    ucard_number: z.number().int().min(0).max(2147483647), // std::int32
    username: z.string(), // std::str
  });

export const UpdateUserSchema = z.
  object({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // users::User
    first_name: z.string(), // std::str
    last_name: z.string().optional(), // std::str
    display_name: z.string().optional(), // std::str
    email: z.string().regex(/[\w\-\.]+/), // std::str
    organisational_unit: z.string(), // std::str
    profile_picture: z.string().optional(), // std::str
    pronouns: z.string().optional(), // std::str
    ucard_number: z.number().int().min(0).max(2147483647), // std::int32
    username: z.string(), // std::str
  });
// #endregion

// #region users::UserSettingValue
export const CreateUserSettingValueSchema = z.
  object({
    value: z.string(), // std::str
  });

export const UpdateUserSettingValueSchema = z.
  object({
    value: z.string(), // std::str
  });
// #endregion