import { z } from "zod";

// #region default::Auditable
export const CreateAuditableSchema = z.
  object({ // default::CreatedAt
    created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  });

export const UpdateAuditableSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  });
// #endregion

// #region default::CreatedAt
export const CreateCreatedAtSchema = z.
  object({
    created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  });

export const UpdateCreatedAtSchema = z.
  object({
  });
// #endregion

// #region default::Timed
export const CreateTimedSchema = z.
  object({ // default::CreatedAt
    created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // default::Timed
    ends_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  });

export const UpdateTimedSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // default::Timed
    ends_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  });
// #endregion
