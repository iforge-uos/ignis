import { CreateReasonSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import { createZodDto } from "nestjs-zod";

export class CreateReasonDto extends createZodDto(CreateReasonSchema.omit({ created_at: true, updated_at: true })) {}
