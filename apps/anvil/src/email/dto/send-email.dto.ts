import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const SendEmailSchema = z.object({
  recipients: z.array(z.string().email()),
  subject: z.string().max(255),
  plainTextMessage: z.string().optional(),
  priority: z.number().int().min(1).max(69).optional().nullable(), // Priority: 1 for high, 2 for medium, 3 for low, etc.
  message: z.string().optional(),
});

export class SendEmailDto extends createZodDto(SendEmailSchema) {}
