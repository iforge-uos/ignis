import { Module } from "@nestjs/common";
import { AuthorizationService } from "./services/authorization.service";
import { CaslAbilityGuard } from "./guards/casl-ability.guard";
import { EdgeDBModule } from "@/edgedb/edgedb.module";

@Module({
  imports: [EdgeDBModule],
  providers: [AuthorizationService, CaslAbilityGuard],
  exports: [AuthorizationService, CaslAbilityGuard],
})
export class AuthorizationModule {}
