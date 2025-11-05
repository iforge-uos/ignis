import * as z from "zod/v4";
import * as zt from "zod-temporal";


// #region ai_rep::Question
export const CreateQuestionSchema = z.
  object({
    rep_only: z.boolean().optional(), // std::bool
    title: z.string(), // std::str
    answer: z.string(), // std::str
  });

export const UpdateQuestionSchema = z.
  object({
    rep_only: z.boolean().optional(), // std::bool
    title: z.string(), // std::str
    answer: z.string(), // std::str
  });
// #endregion
