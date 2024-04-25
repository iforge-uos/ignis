import { Logger, Module } from "@nestjs/common";
import { UsersService } from "@/users/users.service";
import { AuthorizationModule } from "@/auth/authorization/authorization.module";
import { EdgeDBModule } from "@/edgedb/edgedb.module";
import { TrainingService } from "@/training/training.service";
import { SignInService } from "./sign-in.service";
import { LdapService } from "@/ldap/ldap.service";
import { SignInController } from "./sign-in.controller";
import { EmailService } from "@/email/email.service";
import { BullModule } from "@nestjs/bull";
import { LdapModule } from "@/ldap/ldap.module";

@Module({
  imports: [AuthorizationModule, EdgeDBModule, BullModule.registerQueue({ name: "email" }), LdapModule],
  controllers: [SignInController],
  providers: [UsersService, TrainingService, EmailService, SignInService, LdapService, Logger],
  exports: [UsersService],
})
export class SignInModule {}
