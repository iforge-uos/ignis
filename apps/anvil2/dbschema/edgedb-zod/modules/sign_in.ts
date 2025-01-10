import { z } from "zod";

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
  object({ // default::CreatedAt
    created_at: z.date().optional(), // std::datetime
  })
  .extend({ // sign_in::Agreement
    version: z.number().int().min(0).max(65535).optional(), // std::int16
    content: z.string(), // std::str
    name: z.string(), // std::str
    content_hash: z.never().optional(), // std::bytes
  });

export const UpdateAgreementSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // sign_in::Agreement
    version: z.number().int().min(0).max(65535).optional(), // std::int16
    content: z.string(), // std::str
    name: z.string(), // std::str
    content_hash: z.never().optional(), // std::bytes
  });
// #endregion

// #region sign_in::Location
export const CreateLocationSchema = z.
  object({ // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({ // sign_in::Location
    closing_time: z.never(), // cal::local_time
    opening_days: z.number().int().min(0).max(65535), // std::int16
    opening_time: z.never(), // cal::local_time
    name: z.enum(["MAINSPACE", "HEARTSPACE"]), // sign_in::LocationName
    in_of_hours_rep_multiplier: z.number().int().min(0).max(65535), // std::int16
    max_users: z.number().int().min(0).max(65535), // std::int16
    out_of_hours_rep_multiplier: z.number().int().min(0).max(65535), // std::int16
    queue_enabled: z.boolean().optional(), // std::bool
  });

export const UpdateLocationSchema = z.
  object({ // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({ // sign_in::Location
    closing_time: z.never(), // cal::local_time
    opening_days: z.number().int().min(0).max(65535), // std::int16
    opening_time: z.never(), // cal::local_time
    name: z.enum(["MAINSPACE", "HEARTSPACE"]), // sign_in::LocationName
    in_of_hours_rep_multiplier: z.number().int().min(0).max(65535), // std::int16
    max_users: z.number().int().min(0).max(65535), // std::int16
    out_of_hours_rep_multiplier: z.number().int().min(0).max(65535), // std::int16
    queue_enabled: z.boolean().optional(), // std::bool
  });
// #endregion

// #region sign_in::QueuePlace
export const CreateQueuePlaceSchema = z.
  object({ // default::CreatedAt
    created_at: z.date().optional(), // std::datetime
  })
  .extend({ // sign_in::QueuePlace
    notified_at: z.date().optional(), // std::datetime
  });

export const UpdateQueuePlaceSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // sign_in::QueuePlace
    notified_at: z.date().optional(), // std::datetime
  });
// #endregion

// #region sign_in::Reason
export const CreateReasonSchema = z.
  object({ // default::CreatedAt
    created_at: z.date().optional(), // std::datetime
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
    ends_at: z.date().optional(), // std::datetime
  })
  .extend({ // sign_in::SignIn
    tools: z.string().array(), // array<std::str>
  });

export const UpdateSignInSchema = z.
  object({ // default::Timed
    ends_at: z.date().optional(), // std::datetime
  })
  .extend({ // sign_in::SignIn
    tools: z.string().array(), // array<std::str>
  });
// #endregion

// #region sign_in::UserRegistration
export const CreateUserRegistrationSchema = z.
  object({ // default::CreatedAt
    created_at: z.date().optional(), // std::datetime
  })
  .extend({ // sign_in::UserRegistration
  });

export const UpdateUserRegistrationSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // sign_in::UserRegistration
  });
// #endregion
