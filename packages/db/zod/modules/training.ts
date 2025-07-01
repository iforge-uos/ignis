import { z } from "zod/v4";

// #region training::AnswerType
export const AnswerTypeSchema = z.enum(["SINGLE", "MULTI"]);
// #endregion

// #region training::LocationName
export const LocationNameSchema = z.enum(["MAINSPACE", "HEARTSPACE", "GEORGE_PORTER"]);
// #endregion

// #region training::Answer
export const CreateAnswerSchema = z.object({
  content: z.string(), // std::str
  correct: z.boolean().optional(), // std::bool
  description: z.string().nullable(), // std::str
});

export const UpdateAnswerSchema = z.object({
  content: z.string(), // std::str
  correct: z.boolean().optional(), // std::bool
  description: z.string().nullable(), // std::str
});
// #endregion

// #region training::Interactable
export const CreateInteractableSchema = z.object({
  content: z.string(), // std::str
  enabled: z.boolean().optional(), // std::bool
  index: z.number().int().min(-32768).max(32767), // std::int16
});

export const UpdateInteractableSchema = z.object({
  content: z.string(), // std::str
  enabled: z.boolean().optional(), // std::bool
  index: z.number().int().min(-32768).max(32767), // std::int16
});
// #endregion

// #region training::Page
export const CreatePageSchema = z
  .object({
    // training::TrainingPage
    duration: z.iso.duration().nullable(), // std::duration
    name: z.string(), // std::str
  })
  .extend({
    // training::Interactable
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(-32768).max(32767), // std::int16
  })
  .extend({
    // training::Page
  });

export const UpdatePageSchema = z
  .object({
    // training::TrainingPage
    duration: z.iso.duration().nullable(), // std::duration
    name: z.string(), // std::str
  })
  .extend({
    // training::Interactable
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(-32768).max(32767), // std::int16
  })
  .extend({
    // training::Page
  });
// #endregion

// #region training::Question
export const CreateQuestionSchema = z
  .object({
    // training::Interactable
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(-32768).max(32767), // std::int16
  })
  .extend({
    // training::Question
    type: z.enum(["SINGLE", "MULTI"]), // training::AnswerType
  });

export const UpdateQuestionSchema = z
  .object({
    // training::Interactable
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(-32768).max(32767), // std::int16
  })
  .extend({
    // training::Question
    type: z.enum(["SINGLE", "MULTI"]), // training::AnswerType
  });
// #endregion

// #region training::Session
export const CreateSessionSchema = z
  .object({
    // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
    created_at: z.date().optional(), // std::datetime
  })
  .extend({
    // training::Session
    index: z.number().int().min(-32768).max(32767).optional(), // std::int16
  });

export const UpdateSessionSchema = z
  .object({
    // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
  })
  .extend({
    // training::Session
    index: z.number().int().min(-32768).max(32767).optional(), // std::int16
  });
// #endregion

// #region training::Training
export const CreateTrainingSchema = z
  .object({
    // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
    created_at: z.date().optional(), // std::datetime
  })
  .extend({
    // training::Training
    in_person: z.boolean(), // std::bool
    locations: z.enum(["MAINSPACE", "HEARTSPACE", "GEORGE_PORTER"]), // training::LocationName
    name: z.string(), // std::str
    compulsory: z.boolean().optional(), // std::bool
    description: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    expires_after: z.iso.duration().nullable(), // std::duration
    icon_url: z.string().nullable(), // std::str
    training_lockout: z.iso.duration().nullable(), // std::duration
  });

export const UpdateTrainingSchema = z
  .object({
    // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
  })
  .extend({
    // training::Training
    in_person: z.boolean(), // std::bool
    locations: z.enum(["MAINSPACE", "HEARTSPACE", "GEORGE_PORTER"]), // training::LocationName
    name: z.string(), // std::str
    compulsory: z.boolean().optional(), // std::bool
    description: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    expires_after: z.iso.duration().nullable(), // std::duration
    icon_url: z.string().nullable(), // std::str
    training_lockout: z.iso.duration().nullable(), // std::duration
  });
// #endregion

// #region training::TrainingPage
export const CreateTrainingPageSchema = z
  .object({
    // training::Interactable
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(-32768).max(32767), // std::int16
  })
  .extend({
    // training::TrainingPage
    duration: z.iso.duration().nullable(), // std::duration
    name: z.string(), // std::str
  });

export const UpdateTrainingPageSchema = z
  .object({
    // training::Interactable
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(-32768).max(32767), // std::int16
  })
  .extend({
    // training::TrainingPage
    duration: z.iso.duration().nullable(), // std::duration
    name: z.string(), // std::str
  });
// #endregion
