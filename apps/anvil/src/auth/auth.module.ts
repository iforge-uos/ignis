import { Module } from "@nestjs/common";
import { AuthenticationModule } from "./authentication/authentication.module";
import { AuthorizationModule } from "./authorization/authorization.module";

@Module({
  imports: [AuthenticationModule, AuthorizationModule],
})
export class AuthModule {}
