import { IsAdmin } from "@/auth/authorization/decorators/check-roles-decorator";
import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { EmailService } from "./email.service";

@Controller("email")
@UseGuards(AuthGuard("jwt"))
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post("agreement_update")
  @IsAdmin()
  async sendAgreementUpdate() {
    console.log("Sending agreement update email out, this will take a while...");
    await this.emailService.sendAgreementUpdate();
    console.log("Finished adding to queue");
  }
}
