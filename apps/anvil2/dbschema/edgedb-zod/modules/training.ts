import { z } from "zod";

// #region training::AnswerType
export const AnswerTypeSchema = z.enum(["SINGLE", "MULTI"]);
// #endregion

// #region training::TrainingLocation
export const TrainingLocationSchema = z.enum(["MAINSPACE", "HEARTSPACE", "GEORGE_PORTER"]);
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

// #region training::Training
export const CreateTrainingSchema = z.
  object({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // training::Training
    name: z.string(), // std::str
    compulsory: z.boolean().optional(), // std::bool
    description: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    expires_after: z.never().optional(), // std::duration
    in_person: z.boolean(), // std::bool
    locations: z.enum(["MAINSPACE", "HEARTSPACE", "GEORGE_PORTER"]), // training::TrainingLocation
    training_lockout: z.never().optional(), // std::duration
    icon_url: z.string().optional(), // std::str
  });

export const UpdateTrainingSchema = z.
  object({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // training::Training
    name: z.string(), // std::str
    compulsory: z.boolean().optional(), // std::bool
    description: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    expires_after: z.never().optional(), // std::duration
    in_person: z.boolean(), // std::bool
    locations: z.enum(["MAINSPACE", "HEARTSPACE", "GEORGE_PORTER"]), // training::TrainingLocation
    training_lockout: z.never().optional(), // std::duration
    icon_url: z.string().optional(), // std::str
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
    duration: z.never().optional(), // std::duration
    name: z.string(), // std::str
  });

export const UpdateTrainingPageSchema = z.
  object({ // training::Interactable
    content: z.string(), // std::str
    enabled: z.boolean().optional(), // std::bool
    index: z.number().int().min(0).max(65535), // std::int16
  })
  .extend({ // training::TrainingPage
    duration: z.never().optional(), // std::duration
    name: z.string(), // std::str
  });
// #endregion

// #region training::UserTrainingSession
export const CreateUserTrainingSessionSchema = z.
  object({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // training::UserTrainingSession
    index: z.number().int().min(0).max(65535).optional(), // std::int16
  });

export const UpdateUserTrainingSessionSchema = z.
  object({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // training::UserTrainingSession
    index: z.number().int().min(0).max(65535).optional(), // std::int16
  });
// #endregion
