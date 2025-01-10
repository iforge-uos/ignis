import { z } from "zod";

// #region ext::auth::Auditable
export const CreateauthSchema = z.
  object({
    created_at: z.date().optional(), // std::datetime
    modified_at: z.date(), // std::datetime
  });

export const UpdateauthSchema = z.
  object({
    modified_at: z.date(), // std::datetime
  });
// #endregion

// #region ext::auth::Identity
export const CreateauthSchema = z.
  object({ // ext::auth::Auditable
    created_at: z.date().optional(), // std::datetime
    modified_at: z.date(), // std::datetime
  })
  .extend({ // ext::auth::Identity
    issuer: z.string(), // std::str
    subject: z.string(), // std::str
  });

export const UpdateauthSchema = z.
  object({ // ext::auth::Auditable
    modified_at: z.date(), // std::datetime
  })
  .extend({ // ext::auth::Identity
    issuer: z.string(), // std::str
    subject: z.string(), // std::str
  });
// #endregion

// #region ext::auth::ClientTokenIdentity
export const CreateauthSchema = z.
  object({ // ext::auth::Identity
    issuer: z.string(), // std::str
    subject: z.string(), // std::str
  })
  .extend({ // ext::auth::ClientTokenIdentity
  });

export const UpdateauthSchema = z.
  object({ // ext::auth::Identity
    issuer: z.string(), // std::str
    subject: z.string(), // std::str
  })
  .extend({ // ext::auth::ClientTokenIdentity
  });
// #endregion

// #region ext::auth::Factor
export const CreateauthSchema = z.
  object({ // ext::auth::Auditable
    created_at: z.date().optional(), // std::datetime
    modified_at: z.date(), // std::datetime
  })
  .extend({ // ext::auth::Factor
  });

export const UpdateauthSchema = z.
  object({ // ext::auth::Auditable
    modified_at: z.date(), // std::datetime
  })
  .extend({ // ext::auth::Factor
  });
// #endregion

// #region ext::auth::EmailFactor
export const CreateauthSchema = z.
  object({ // ext::auth::Factor
  })
  .extend({ // ext::auth::EmailFactor
    email: z.string(), // std::str
    verified_at: z.date().optional(), // std::datetime
  });

export const UpdateauthSchema = z.
  object({ // ext::auth::Factor
  })
  .extend({ // ext::auth::EmailFactor
    email: z.string(), // std::str
    verified_at: z.date().optional(), // std::datetime
  });
// #endregion

// #region ext::auth::EmailPasswordFactor
export const CreateauthSchema = z.
  object({ // ext::auth::EmailFactor
    email: z.string(), // std::str
    verified_at: z.date().optional(), // std::datetime
  })
  .extend({ // ext::auth::EmailPasswordFactor
    email: z.string(), // std::str
    password_hash: z.string(), // std::str
  });

export const UpdateauthSchema = z.
  object({ // ext::auth::EmailFactor
    email: z.string(), // std::str
    verified_at: z.date().optional(), // std::datetime
  })
  .extend({ // ext::auth::EmailPasswordFactor
    email: z.string(), // std::str
    password_hash: z.string(), // std::str
  });
// #endregion

// #region ext::auth::LocalIdentity
export const CreateauthSchema = z.
  object({ // ext::auth::Identity
    issuer: z.string(), // std::str
    subject: z.string(), // std::str
  })
  .extend({ // ext::auth::LocalIdentity
    subject: z.string(), // std::str
  });

export const UpdateauthSchema = z.
  object({ // ext::auth::Identity
    issuer: z.string(), // std::str
    subject: z.string(), // std::str
  })
  .extend({ // ext::auth::LocalIdentity
    subject: z.string(), // std::str
  });
// #endregion

// #region ext::auth::MagicLinkFactor
export const CreateauthSchema = z.
  object({ // ext::auth::EmailFactor
    email: z.string(), // std::str
    verified_at: z.date().optional(), // std::datetime
  })
  .extend({ // ext::auth::MagicLinkFactor
    email: z.string(), // std::str
  });

export const UpdateauthSchema = z.
  object({ // ext::auth::EmailFactor
    email: z.string(), // std::str
    verified_at: z.date().optional(), // std::datetime
  })
  .extend({ // ext::auth::MagicLinkFactor
    email: z.string(), // std::str
  });
// #endregion

// #region ext::auth::PKCEChallenge
export const CreateauthSchema = z.
  object({ // ext::auth::Auditable
    created_at: z.date().optional(), // std::datetime
    modified_at: z.date(), // std::datetime
  })
  .extend({ // ext::auth::PKCEChallenge
    challenge: z.string(), // std::str
    auth_token: z.string().optional(), // std::str
    refresh_token: z.string().optional(), // std::str
  });

export const UpdateauthSchema = z.
  object({ // ext::auth::Auditable
    modified_at: z.date(), // std::datetime
  })
  .extend({ // ext::auth::PKCEChallenge
    challenge: z.string(), // std::str
    auth_token: z.string().optional(), // std::str
    refresh_token: z.string().optional(), // std::str
  });
// #endregion

// #region ext::auth::WebAuthnAuthenticationChallenge
export const CreateauthSchema = z.
  object({ // ext::auth::Auditable
    created_at: z.date().optional(), // std::datetime
    modified_at: z.date(), // std::datetime
  })
  .extend({ // ext::auth::WebAuthnAuthenticationChallenge
    challenge: z.never(), // std::bytes
  });

export const UpdateauthSchema = z.
  object({ // ext::auth::Auditable
    modified_at: z.date(), // std::datetime
  })
  .extend({ // ext::auth::WebAuthnAuthenticationChallenge
    challenge: z.never(), // std::bytes
  });
// #endregion

// #region ext::auth::WebAuthnFactor
export const CreateauthSchema = z.
  object({ // ext::auth::EmailFactor
    email: z.string(), // std::str
    verified_at: z.date().optional(), // std::datetime
  })
  .extend({ // ext::auth::WebAuthnFactor
    user_handle: z.never(), // std::bytes
    credential_id: z.never(), // std::bytes
    public_key: z.never(), // std::bytes
  });

export const UpdateauthSchema = z.
  object({ // ext::auth::EmailFactor
    email: z.string(), // std::str
    verified_at: z.date().optional(), // std::datetime
  })
  .extend({ // ext::auth::WebAuthnFactor
    user_handle: z.never(), // std::bytes
    credential_id: z.never(), // std::bytes
    public_key: z.never(), // std::bytes
  });
// #endregion

// #region ext::auth::WebAuthnRegistrationChallenge
export const CreateauthSchema = z.
  object({ // ext::auth::Auditable
    created_at: z.date().optional(), // std::datetime
    modified_at: z.date(), // std::datetime
  })
  .extend({ // ext::auth::WebAuthnRegistrationChallenge
    challenge: z.never(), // std::bytes
    email: z.string(), // std::str
    user_handle: z.never(), // std::bytes
  });

export const UpdateauthSchema = z.
  object({ // ext::auth::Auditable
    modified_at: z.date(), // std::datetime
  })
  .extend({ // ext::auth::WebAuthnRegistrationChallenge
    challenge: z.never(), // std::bytes
    email: z.string(), // std::str
    user_handle: z.never(), // std::bytes
  });
// #endregion
