import * as z from "zod/v4";
import * as zt from "zod-temporal";


// #region default::_BaseListenable
export const Create_BaseListenableSchema = z.
  object({
  });

export const Update_BaseListenableSchema = z.
  object({
  });
// #endregion

// #region default::Auditable
export const CreateAuditableSchema = z.
  object({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  });

export const UpdateAuditableSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  });
// #endregion

// #region default::CreatedAt
export const CreateCreatedAtSchema = z.
  object({
    created_at: zt.zonedDateTime().optional(), // std::datetime
  });

export const UpdateCreatedAtSchema = z.
  object({
  });
// #endregion

// #region default::Listenable
export const CreateListenableSchema = z.
  object({ // default::_BaseListenable
  })
  .extend({ // default::Listenable
  });

export const UpdateListenableSchema = z.
  object({ // default::_BaseListenable
  })
  .extend({ // default::Listenable
  });
// #endregion

// #region default::ListenableWithChanges
export const CreateListenableWithChangesSchema = z.
  object({ // default::_BaseListenable
  })
  .extend({ // default::ListenableWithChanges
  });

export const UpdateListenableWithChangesSchema = z.
  object({ // default::_BaseListenable
  })
  .extend({ // default::ListenableWithChanges
  });
// #endregion

// #region default::Timed
export const CreateTimedSchema = z.
  object({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::Timed
    ends_at: zt.zonedDateTime().nullable(), // std::datetime
  });

export const UpdateTimedSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // default::Timed
    ends_at: zt.zonedDateTime().nullable(), // std::datetime
  });
// #endregion

// #region default::user
export const CreateuserSchema = z.
  object({ // users::User
    first_name: z.string(), // std::str
    last_name: z.string().nullable(), // std::str
    display_name: z.string().optional(), // std::str
    email: z.string().regex(/[\w\-\.]+/), // std::str
    organisational_unit: z.string(), // std::str
    profile_picture: z.string().nullable(), // std::str
    pronouns: z.string().nullable(), // std::str
    username: z.string(), // std::str
    funds: z.int().min(-2147483648).max(2147483647).optional(), // std::int32
    ucard_number: z.int().min(-2147483648).max(2147483647), // std::int32
  })
  .extend({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::Listenable
  })
  .extend({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::_BaseListenable
  })
  .extend({ // default::user
  });

export const UpdateuserSchema = z.
  object({ // users::User
    first_name: z.string(), // std::str
    last_name: z.string().nullable(), // std::str
    display_name: z.string().optional(), // std::str
    email: z.string().regex(/[\w\-\.]+/), // std::str
    organisational_unit: z.string(), // std::str
    profile_picture: z.string().nullable(), // std::str
    pronouns: z.string().nullable(), // std::str
    username: z.string(), // std::str
    funds: z.int().min(-2147483648).max(2147483647).optional(), // std::int32
    ucard_number: z.int().min(-2147483648).max(2147483647), // std::int32
  })
  .extend({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::Listenable
  })
  .extend({ // default::CreatedAt
  })
  .extend({ // default::_BaseListenable
  })
  .extend({ // default::user
  });
// #endregion
