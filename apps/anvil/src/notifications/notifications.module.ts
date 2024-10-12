import { AuthorizationModule } from "@/auth/authorization/authorization.module";
import { EdgeDBModule } from "@/edgedb/edgedb.module";
import { BullModule } from "@nestjs/bull";
import { Logger, Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [EdgeDBModule, AuthorizationModule, BullModule.registerQueue({ name: "email" })],
  controllers: [NotificationsController],
  providers: [NotificationsService, Logger],
  exports: [NotificationsService],
})
export class NotificationsModule {}
