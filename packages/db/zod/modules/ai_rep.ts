import { z } from "zod/v4";

// #region ai_rep::Question
export const CreateQuestionSchema = z.object({
  answer: z.string(), // std::str
  title: z.string(), // std::str
  rep_only: z.boolean().optional(), // std::bool
});

export const UpdateQuestionSchema = z.object({
  answer: z.string(), // std::str
  title: z.string(), // std::str
  rep_only: z.boolean().optional(), // std::bool
});
// #endregion
