import { z } from "zod";

// #region auth::PermissionAction
export const PermissionActionSchema = z.enum(["READ", "UPDATE", "CREATE", "DELETE"]);
// #endregion

// #region auth::PermissionSubject
export const PermissionSubjectSchema = z.enum(["ALL", "SELF", "USER"]);
// #endregion

// #region auth::BlacklistedToken
export const CreateBlacklistedTokenSchema = z.
  object({
    expires: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/), // std::datetime
    token: z.string(), // std::str
  });

export const UpdateBlacklistedTokenSchema = z.
  object({
    expires: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/), // std::datetime
    token: z.string(), // std::str
  });
// #endregion

// #region auth::Permission
export const CreatePermissionSchema = z.
  object({
    action: z.enum(["READ", "UPDATE", "CREATE", "DELETE"]), // auth::PermissionAction
    subject: z.enum(["ALL", "SELF", "USER"]), // auth::PermissionSubject
  });

export const UpdatePermissionSchema = z.
  object({
    action: z.enum(["READ", "UPDATE", "CREATE", "DELETE"]), // auth::PermissionAction
    subject: z.enum(["ALL", "SELF", "USER"]), // auth::PermissionSubject
  });
// #endregion

// #region auth::Role
export const CreateRoleSchema = z.
  object({
    name: z.string(), // std::str
  });

export const UpdateRoleSchema = z.
  object({
    name: z.string(), // std::str
  });
// #endregion
