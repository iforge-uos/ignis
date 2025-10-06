import { Logger, Module } from "@nestjs/common";
import { IntegrationsModule } from "./integrations/integrations.module";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { AuthorizationModule } from "@/auth/authorization/authorization.module";
import { EdgeDBModule } from "@/edgedb/edgedb.module";
import { TrainingService } from "@/training/training.service";
import { LdapModule } from "@/ldap/ldap.module";
import { RootModule } from "@/root/root.module";

@Module({
  imports: [IntegrationsModule, AuthorizationModule, EdgeDBModule, LdapModule, RootModule],
  controllers: [UsersController],
  providers: [UsersService, TrainingService, Logger],
  exports: [UsersService],
})
export class UsersModule {}
