import { EdgeDBModule } from "@/edgedb/edgedb.module" ;
import { ResponseFormatInterceptor } from "@/response-format/response-format.interceptor";
import { ResponseFormatService } from "@/response-format/response-format.service";
import { TrainingService } from "@/training/training.service";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import { ZodValidationPipe } from "nestjs-zod";
import { AuthenticationModule } from "./auth/authentication/authentication.module";
import { AuthorizationModule } from "./auth/authorization/authorization.module";
import { EmailModule } from "./email/email.module";
import { EmailService } from "./email/email.service";
import { FiltersModule } from "./filters/filters.module";
import { GoogleService } from './google/google.service';
import { LdapModule } from "./ldap/ldap.module";
import { RootController } from "./root/root.controller";
import { RootModule } from "./root/root.module";
import { RootService } from "./root/root.service";
import { SeederModule } from "./seeder/seeder.module";
import { SeederService } from "./seeder/seeder.service";
import { SignInController } from "./sign-in/sign-in.controller";
import { SignInModule } from "./sign-in/sign-in.module";
import { SignInService } from "./sign-in/sign-in.service";
import { TrainingController } from './training/training.controller';
import { UsersModule } from "./users/users.module";


@Module({
  imports: [
    EdgeDBModule,
    UsersModule,
    AuthenticationModule,
    LdapModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env.production',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
    ]),
    AuthorizationModule,
    EmailModule,
    FiltersModule,
    SeederModule,
    SignInModule,
    BullModule.registerQueue({ name: "email" }),
    RootModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor,
    },
    SeederService,
    TrainingService,
    SignInService,
    EmailService,
    RootService,
    ResponseFormatService,
    GoogleService,
  ],
  controllers: [SignInController, RootController, TrainingController],
})
export class AppModule {}
