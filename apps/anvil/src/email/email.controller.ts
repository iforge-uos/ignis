import { IsAdmin } from "@/auth/authorization/decorators/check-roles-decorator";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { EmailService } from "./email.service";

@Controller("email")
@UseGuards(AuthGuard("jwt"))
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get("agreement_update")
  @IsAdmin()
  async sendAgreementUpdate() {
    await this.emailService.sendAgreementUpdate();
  }
}
