import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const CreateAgreementSchema = z.object({
  reason_ids: z.array(z.string()),
  content: z.string(),
});
export const UpdateAgreementSchema = z.object({
  reason_ids: z.array(z.string()),
  content: z.string(),
});

export class CreateAgreementDto extends createZodDto(UpdateAgreementSchema) {}
export class UpdateAgreementDto extends createZodDto(UpdateAgreementSchema) {}
