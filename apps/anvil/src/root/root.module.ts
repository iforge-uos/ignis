import { AuthorizationService } from "@/auth/authorization/services/authorization.service";
import { EdgeDBModule } from "@/edgedb/edgedb.module";
import { EdgeDBService } from "@/edgedb/edgedb.service";
import { EmailService } from "@/email/email.service";
import { GoogleService } from "@/google/google.service";
import { LdapModule } from "@/ldap/ldap.module";
import { SignInService } from "@/sign-in/sign-in.service";
import { TrainingService } from "@/training/training.service";
import { UsersService } from "@/users/users.service";
import { BullModule } from "@nestjs/bull";
import { Logger, Module } from "@nestjs/common";
import { RootController } from "./root.controller";
import { RootService } from "./root.service";

@Module({
  imports: [EdgeDBModule, LdapModule, BullModule.registerQueue({ name: "email" })],
  controllers: [RootController],
  providers: [
    UsersService,
    RootService,
    EdgeDBService,
    SignInService,
    EmailService,
    TrainingService,
    GoogleService,
    AuthorizationService,
    Logger,
  ],
  exports: [RootService],
})
export class RootModule {}
