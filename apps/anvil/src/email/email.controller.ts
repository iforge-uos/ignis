import { Controller, UseFilters } from "@nestjs/common";
import { EmailExceptionFilter } from "@/filters/email/email.filter";
import { EmailService } from "./email.service";

@Controller("email")
@UseFilters(new EmailExceptionFilter())
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
}
