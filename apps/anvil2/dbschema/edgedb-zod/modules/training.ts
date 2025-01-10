import { z } from "zod";

// #region training::AnswerType
export const AnswerTypeSchema = z.enum(["SINGLE", "MULTI"]);
// #endregion

// #region training::LocationName
export const LocationNameSchema = z.enum(["MAINSPACE", "HEARTSPACE", "GEORGE_PORTER"]);
// #endregion

// #region training::Answer
export const CreateAnswerSchema = z.
  object({
    content: z.string(), // std::str
    correct: z.boolean().optional(), // std::bool
    description: z.string().optional(), // std::str
  });

export const UpdateAnswerSchema = z.
  object({
    content: z.string(), // std::str
    correct: z.boolean().optional(), // std::bool
    description: z.string().optional(), // std::str
  });
// #endregion

// #region training::Interactable
export const CreateInteractableSchema = z.
  object({
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(0).max(65535), // std::int16
  });

export const UpdateInteractableSchema = z.
  object({
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(0).max(65535), // std::int16
  });
// #endregion

// #region training::Page
export const CreatePageSchema = z.
  object({ // training::TrainingPage
    duration: z.string().regex(/^(\d+(\.\d+)?\s(microseconds|milliseconds|seconds|minutes|hours)\s?)+$/).optional(), // std::duration
    name: z.string(), // std::str
  })
  .extend({ // training::Page
  });

export const UpdatePageSchema = z.
  object({ // training::TrainingPage
    duration: z.string().regex(/^(\d+(\.\d+)?\s(microseconds|milliseconds|seconds|minutes|hours)\s?)+$/).optional(), // std::duration
    name: z.string(), // std::str
  })
  .extend({ // training::Page
  });
// #endregion

// #region training::Question
export const CreateQuestionSchema = z.
  object({ // training::Interactable
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(0).max(65535), // std::int16
  })
  .extend({ // training::Question
    type: z.enum(["SINGLE", "MULTI"]), // training::AnswerType
  });

export const UpdateQuestionSchema = z.
  object({ // training::Interactable
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(0).max(65535), // std::int16
  })
  .extend({ // training::Question
    type: z.enum(["SINGLE", "MULTI"]), // training::AnswerType
  });
// #endregion

// #region training::Session
export const CreateSessionSchema = z.
  object({ // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({ // training::Session
    index: z.number().int().min(0).max(65535).optional(), // std::int16
  });

export const UpdateSessionSchema = z.
  object({ // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({ // training::Session
    index: z.number().int().min(0).max(65535).optional(), // std::int16
  });
// #endregion

// #region training::Training
export const CreateTrainingSchema = z.
  object({ // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({ // training::Training
    in_person: z.boolean(), // std::bool
    locations: z.enum(["MAINSPACE", "HEARTSPACE", "GEORGE_PORTER"]), // training::LocationName
    name: z.string(), // std::str
    compulsory: z.boolean().optional(), // std::bool
    description: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    expires_after: z.string().regex(/^(\d+(\.\d+)?\s(microseconds|milliseconds|seconds|minutes|hours)\s?)+$/).optional(), // std::duration
    icon_url: z.string().optional(), // std::str
    training_lockout: z.string().regex(/^(\d+(\.\d+)?\s(microseconds|milliseconds|seconds|minutes|hours)\s?)+$/).optional(), // std::duration
  });

export const UpdateTrainingSchema = z.
  object({ // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({ // training::Training
    in_person: z.boolean(), // std::bool
    locations: z.enum(["MAINSPACE", "HEARTSPACE", "GEORGE_PORTER"]), // training::LocationName
    name: z.string(), // std::str
    compulsory: z.boolean().optional(), // std::bool
    description: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    expires_after: z.string().regex(/^(\d+(\.\d+)?\s(microseconds|milliseconds|seconds|minutes|hours)\s?)+$/).optional(), // std::duration
    icon_url: z.string().optional(), // std::str
    training_lockout: z.string().regex(/^(\d+(\.\d+)?\s(microseconds|milliseconds|seconds|minutes|hours)\s?)+$/).optional(), // std::duration
  });
// #endregion

// #region training::TrainingPage
export const CreateTrainingPageSchema = z.
  object({ // training::Interactable
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(0).max(65535), // std::int16
  })
  .extend({ // training::TrainingPage
    duration: z.string().regex(/^(\d+(\.\d+)?\s(microseconds|milliseconds|seconds|minutes|hours)\s?)+$/).optional(), // std::duration
    name: z.string(), // std::str
  });

export const UpdateTrainingPageSchema = z.
  object({ // training::Interactable
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(0).max(65535), // std::int16
  })
  .extend({ // training::TrainingPage
    duration: z.string().regex(/^(\d+(\.\d+)?\s(microseconds|milliseconds|seconds|minutes|hours)\s?)+$/).optional(), // std::duration
    name: z.string(), // std::str
  });
// #endregion
