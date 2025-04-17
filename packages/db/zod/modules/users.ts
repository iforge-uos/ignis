import { Temporal } from "@js-temporal/polyfill";
import { Duration } from "gel";
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
    created_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // users::Infraction
    duration: z.union([z.instanceof(Temporal.Duration), z.instanceof(Duration).transform(Temporal.Duration.from), (z.iso.duration().transform((dur) => Temporal.Duration.from(dur)))]).nullable(), // std::duration
    reason: z.string(), // std::str
    resolved: z.boolean().optional(), // std::bool
    type: z.enum(["WARNING", "TEMP_BAN", "PERM_BAN", "RESTRICTION", "TRAINING_ISSUE"]), // users::InfractionType
  });

export const UpdateInfractionSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // users::Infraction
    duration: z.union([z.instanceof(Temporal.Duration), z.instanceof(Duration).transform(Temporal.Duration.from), (z.iso.duration().transform((dur) => Temporal.Duration.from(dur)))]).nullable(), // std::duration
    reason: z.string(), // std::str
    resolved: z.boolean().optional(), // std::bool
    type: z.enum(["WARNING", "TEMP_BAN", "PERM_BAN", "RESTRICTION", "TRAINING_ISSUE"]), // users::InfractionType
  });
// #endregion

// #region users::Integration
export const CreateIntegrationSchema = z.
  object({ // default::Auditable
    updated_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
    created_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // users::Integration
    external_id: z.string(), // std::str
    platform: z.enum(["DISCORD", "GITHUB"]), // users::Platform
    external_email: z.string(), // std::str
  });

export const UpdateIntegrationSchema = z.
  object({ // default::Auditable
    updated_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
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
    last_name: z.string().nullable(), // std::str
    display_name: z.string().optional(), // std::str
    email: z.string().regex(/[\w\-\.]+/), // std::str
    organisational_unit: z.string(), // std::str
    profile_picture: z.string().nullable(), // std::str
    pronouns: z.string().nullable(), // std::str
    ucard_number: z.number().int().min(-2147483648).max(2147483647), // std::int32
    username: z.string(), // std::str
  })
  .extend({ // default::Auditable
    updated_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
    created_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // users::Rep
    status: z.enum(["ACTIVE", "BREAK", "ALUMNI", "FUTURE", "REMOVED"]).optional(), // users::RepStatus
  });

export const UpdateRepSchema = z.
  object({ // users::User
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
  .extend({ // default::Auditable
    updated_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
  })
  .extend({ // users::Rep
    status: z.enum(["ACTIVE", "BREAK", "ALUMNI", "FUTURE", "REMOVED"]).optional(), // users::RepStatus
  });
// #endregion

// #region users::Role
export const CreateRoleSchema = z.
  object({
    name: z.string(), // std::str
  });

export const UpdateRoleSchema = z.
  object({
    name: z.string(), // std::str
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
    updated_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
    created_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // users::User
    first_name: z.string(), // std::str
    last_name: z.string().nullable(), // std::str
    display_name: z.string().optional(), // std::str
    email: z.string().regex(/[\w\-\.]+/), // std::str
    organisational_unit: z.string(), // std::str
    profile_picture: z.string().nullable(), // std::str
    pronouns: z.string().nullable(), // std::str
    ucard_number: z.number().int().min(-2147483648).max(2147483647), // std::int32
    username: z.string(), // std::str
  });

export const UpdateUserSchema = z.
  object({ // default::Auditable
    updated_at: z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]).optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
  })
  .extend({ // users::User
    first_name: z.string(), // std::str
    last_name: z.string().nullable(), // std::str
    display_name: z.string().optional(), // std::str
    email: z.string().regex(/[\w\-\.]+/), // std::str
    organisational_unit: z.string(), // std::str
    profile_picture: z.string().nullable(), // std::str
    pronouns: z.string().nullable(), // std::str
    ucard_number: z.number().int().min(-2147483648).max(2147483647), // std::int32
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

        