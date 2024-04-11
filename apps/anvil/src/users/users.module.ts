import { Module } from "@nestjs/common";
import { IntegrationsModule } from "./integrations/integrations.module";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { AuthorizationModule } from "@/auth/authorization/authorization.module";
import { EdgeDBModule } from "@/edgedb/edgedb.module";
import { TrainingService } from "@/training/training.service";
import { LdapModule } from "@/ldap/ldap.module";

@Module({
  imports: [IntegrationsModule, AuthorizationModule, EdgeDBModule, LdapModule],
  controllers: [UsersController],
  providers: [UsersService, TrainingService],
  exports: [UsersService],
})
export class UsersModule {}
