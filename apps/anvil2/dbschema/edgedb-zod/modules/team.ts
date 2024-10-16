import { z } from "zod";

// #region team::Team
export const CreateTeamSchema = z.
  object({
    description: z.string(), // std::str
    name: z.string(), // std::str
    tag: z.string(), // std::str
  });

export const UpdateTeamSchema = z.
  object({
    description: z.string(), // std::str
    name: z.string(), // std::str
    tag: z.string(), // std::str
  });
// #endregion
