import { Module } from "@nestjs/common";
import { IntegrationsService } from "./integrations.service";
import { EdgeDBModule } from "@/edgedb/edgedb.module";

@Module({
  imports: [EdgeDBModule],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
