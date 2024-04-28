import { Logger, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EdgeDBModule } from "@/edgedb/edgedb.module";
import { AuthorizationModule } from "@/auth/authorization/authorization.module";

@Module({
  imports: [EdgeDBModule, AuthorizationModule],
  providers: [NotificationsService, Logger],
  controllers: [NotificationsController]
})
export class NotificationsModule { }
