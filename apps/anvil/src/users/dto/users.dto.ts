import { CreateInfractionSchema, CreateUserSchema, UpdateUserSchema } from "@dbschema/edgedb-zod/modules/users";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
export class CreateInfractionDto extends createZodDto(CreateInfractionSchema) {}

export const AddInPersonTrainingSchema = z.object({
  rep_id: z.string(),
  created_at: z.date(),
});

export class AddInPersonTrainingDto extends createZodDto(AddInPersonTrainingSchema) {}

export const RevokeTrainingSchema = z.object({
  reason: z.string(),
});

export class RevokeTrainingDto extends createZodDto(RevokeTrainingSchema) {}
