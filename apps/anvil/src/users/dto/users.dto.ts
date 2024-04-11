import {
  CreateUserSchema,
  UpdateUserSchema,
} from "@dbschema/edgedb-zod/modules/users";
import { createZodDto } from "nestjs-zod";

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
