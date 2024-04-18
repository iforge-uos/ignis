import {
  CreateInfractionSchema as CreateInfractionSchema_,
  CreateUserSchema,
  UpdateUserSchema,
} from "@dbschema/edgedb-zod/modules/users";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}

const CreateInfractionSchema = CreateInfractionSchema_.omit({ duration: true }).extend({
  duration: z.number().optional(),
});
export class CreateInfractionDto extends createZodDto(CreateInfractionSchema) {}

export const AddInPersonTrainingSchema = z.object({
  rep_id: z.string(),
  created_at: z.string().datetime(),
});

export class AddInPersonTrainingDto extends createZodDto(AddInPersonTrainingSchema) {}

export const RevokeTrainingSchema = z.object({
  reason: z.string(),
});

export class RevokeTrainingDto extends createZodDto(RevokeTrainingSchema) {}

export const PromoteUserSchema = z.object({
  team_ids: z.array(z.string()),
});

export class PromoteUserDto extends createZodDto(PromoteUserSchema) {}
