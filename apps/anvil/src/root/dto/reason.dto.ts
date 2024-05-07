import { createZodDto } from "nestjs-zod";
import { CreateSignInReasonSchema } from "@dbschema/edgedb-zod/modules/sign_in";

export class CreateSignInReasonCategoryDto extends createZodDto(CreateSignInReasonSchema) {}
