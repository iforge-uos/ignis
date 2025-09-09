import { CreateSignInSchema as _CreateSignInSchema, UpdateReasonSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const SignInSchema = z.object({ ucard_number: z.number() });
const CreateSignInSchema = _CreateSignInSchema.extend({
  reason_id: z.string(),
});
const UpdateSignInSchema = CreateSignInSchema.partial({
  reason_id: true,
  tools: true,
});

export class CreateSignInDto extends createZodDto(SignInSchema) {}
export class FinaliseSignInDto extends createZodDto(CreateSignInSchema) {}
export class UpdateSignInDto extends createZodDto(UpdateSignInSchema) {}
