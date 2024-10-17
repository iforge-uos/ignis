import {
  CreateInfractionSchema as CreateInfractionSchema_,
  CreateUserSchema,
  UpdateUserSchema,
} from "@dbschema/edgedb-zod/modules/users";
import { z } from "zod";

// Re-export the imported schemas
export { CreateUserSchema, UpdateUserSchema };

export const CreateInfractionSchema = CreateInfractionSchema_.omit({ duration: true }).extend({
  duration: z.number().optional(),
});

export const AddInPersonTrainingSchema = z.object({
  rep_id: z.string(),
  created_at: z.string().datetime(),
});

export const RevokeTrainingSchema = z.object({
  reason: z.string(),
});

export const PromoteUserSchema = z.object({
  team_ids: z.array(z.string()),
});

// Type inference
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type CreateInfractionDto = z.infer<typeof CreateInfractionSchema>;
export type AddInPersonTrainingDto = z.infer<typeof AddInPersonTrainingSchema>;
export type RevokeTrainingDto = z.infer<typeof RevokeTrainingSchema>;
export type PromoteUserDto = z.infer<typeof PromoteUserSchema>;
