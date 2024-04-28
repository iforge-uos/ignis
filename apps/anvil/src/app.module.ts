import { EdgeDBModule } from "@/edgedb/edgedb.module";
import { TrainingService } from "@/training/training.service";
import { BullModule } from "@nestjs/bull";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_PIPE } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import { ZodValidationPipe } from "nestjs-zod";
import { AuthenticationModule } from "./auth/authentication/authentication.module";
import { AuthorizationModule } from "./auth/authorization/authorization.module";
import { EmailModule } from "./email/email.module";
import { EmailService } from "./email/email.service";
import { GoogleService } from "./google/google.service";
import { LdapModule } from "./ldap/ldap.module";
import { RootController } from "./root/root.controller";
import { RootModule } from "./root/root.module";
import { RootService } from "./root/root.service";
import { SeederModule } from "./seeder/seeder.module";
import { SeederService } from "./seeder/seeder.service";
import { SignInController } from "./sign-in/sign-in.controller";
import { SignInModule } from "./sign-in/sign-in.module";
import { SignInService } from "./sign-in/sign-in.service";
import { TrainingController } from "./training/training.controller";
import { UsersModule } from "./users/users.module";
import { NotificationsModule } from './notifications/notifications.module';
import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env.production",
    }),
    GracefulShutdownModule.forRoot({ gracefulShutdownTimeout: 300 }),
    EdgeDBModule,
    UsersModule,
    AuthenticationModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000,
        limit: 3,
      },
    ]),
    AuthorizationModule,
    EmailModule,
    SeederModule,
    SignInModule,
    BullModule.registerQueue({ name: "email" }),
    RootModule,
    LdapModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    SeederService,
    TrainingService,
    SignInService,
    EmailService,
    RootService,
    GoogleService,
    Logger,
  ],
  controllers: [SignInController, RootController, TrainingController],
})
export class AppModule { }
