import * as z from "zod/v4";
import * as zt from "zod-temporal";


// #region team::Team
export const CreateTeamSchema = z.
  object({
    name: z.string(), // std::str
    description: z.string(), // std::str
  });

export const UpdateTeamSchema = z.
  object({
    name: z.string(), // std::str
    description: z.string(), // std::str
  });
// #endregion
