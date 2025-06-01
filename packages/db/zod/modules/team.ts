import { z } from "zod/v4";

// #region team::Team
export const CreateTeamSchema = z.object({
  name: z.string(), // std::str
  description: z.string(), // std::str
  tag: z.string(), // std::str
});

export const UpdateTeamSchema = z.object({
  name: z.string(), // std::str
  description: z.string(), // std::str
  tag: z.string(), // std::str
});
// #endregion
