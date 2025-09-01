import * as z from "zod/v4";
import * as zt from "zod-temporal";


// #region sign_in::LocationName
export const LocationNameSchema = z.enum(["MAINSPACE", "HEARTSPACE"]);
// #endregion

// #region sign_in::LocationStatus
export const LocationStatusSchema = z.enum(["OPEN", "SOON", "CLOSED"]);
// #endregion

// #region sign_in::ReasonCategory
export const ReasonCategorySchema = z.enum(["UNIVERSITY_MODULE", "CO_CURRICULAR_GROUP", "PERSONAL_PROJECT", "SOCIETY", "REP_SIGN_IN", "EVENT"]);
// #endregion

// #region sign_in::Agreement
export const CreateAgreementSchema = z.
  object({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // sign_in::Agreement
    content: z.string(), // std::str
    _content_hash: z.never().optional(), // std::bytes
    version: z.int().min(-32768).max(32767).optional(), // std::int16
    name: z.string(), // std::str
  });

export const UpdateAgreementSchema = z.
  object({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
  })
  .extend({ // sign_in::Agreement
    content: z.string(), // std::str
    _content_hash: z.never().optional(), // std::bytes
    version: z.int().min(-32768).max(32767).optional(), // std::int16
    name: z.string(), // std::str
  });
// #endregion

// #region sign_in::Location
export const CreateLocationSchema = z.
  object({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // sign_in::Location
    closing_time: z.never(), // std::cal::local_time
    opening_days: z.int().min(-32768).max(32767), // std::int16
    opening_time: z.never(), // std::cal::local_time
    name: z.enum(["MAINSPACE", "HEARTSPACE"]), // sign_in::LocationName
    max_users: z.int().min(-32768).max(32767), // std::int16
    out_of_hours_rep_multiplier: z.int().min(-32768).max(32767), // std::int16
    queue_enabled: z.boolean().optional(), // std::bool
    in_hours_rep_multiplier: z.int().min(-32768).max(32767), // std::int16
  });

export const UpdateLocationSchema = z.
  object({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
  })
  .extend({ // sign_in::Location
    closing_time: z.never(), // std::cal::local_time
    opening_days: z.int().min(-32768).max(32767), // std::int16
    opening_time: z.never(), // std::cal::local_time
    name: z.enum(["MAINSPACE", "HEARTSPACE"]), // sign_in::LocationName
    max_users: z.int().min(-32768).max(32767), // std::int16
    out_of_hours_rep_multiplier: z.int().min(-32768).max(32767), // std::int16
    queue_enabled: z.boolean().optional(), // std::bool
    in_hours_rep_multiplier: z.int().min(-32768).max(32767), // std::int16
  });
// #endregion

// #region sign_in::QueuePlace
export const CreateQueuePlaceSchema = z.
  object({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // sign_in::QueuePlace
    notified_at: zt.zonedDateTime().nullable(), // std::datetime
  });

export const UpdateQueuePlaceSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // sign_in::QueuePlace
    notified_at: zt.zonedDateTime().nullable(), // std::datetime
  });
// #endregion

// #region sign_in::Reason
export const CreateReasonSchema = z.
  object({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // sign_in::Reason
    name: z.string(), // std::str
    category: z.enum(["UNIVERSITY_MODULE", "CO_CURRICULAR_GROUP", "PERSONAL_PROJECT", "SOCIETY", "REP_SIGN_IN", "EVENT"]), // sign_in::ReasonCategory
  });

export const UpdateReasonSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // sign_in::Reason
    name: z.string(), // std::str
    category: z.enum(["UNIVERSITY_MODULE", "CO_CURRICULAR_GROUP", "PERSONAL_PROJECT", "SOCIETY", "REP_SIGN_IN", "EVENT"]), // sign_in::ReasonCategory
  });
// #endregion

// #region sign_in::SignIn
export const CreateSignInSchema = z.
  object({ // default::Timed
    ends_at: zt.zonedDateTime().nullable(), // std::datetime
  })
  .extend({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // sign_in::SignIn
    tools: z.string().array(), // array<std::str>
  });

export const UpdateSignInSchema = z.
  object({ // default::Timed
    ends_at: zt.zonedDateTime().nullable(), // std::datetime
  })
  .extend({ // default::CreatedAt
  })
  .extend({ // sign_in::SignIn
    tools: z.string().array(), // array<std::str>
  });
// #endregion

// #region sign_in::UserRegistration
export const CreateUserRegistrationSchema = z.
  object({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // sign_in::UserRegistration
  });

export const UpdateUserRegistrationSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // sign_in::UserRegistration
  });
// #endregion
