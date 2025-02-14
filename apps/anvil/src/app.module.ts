import * as process from "node:process";
import { CsrfMiddleware } from "@/auth/authentication/middleware/csrf.middleware";
import { EdgeDBModule } from "@/edgedb/edgedb.module";
import { IdempotencyMiddleware } from "@/shared/middleware/idempotency.middleware";
import { TrainingService } from "@/training/training.service";
import { BullModule } from "@nestjs/bull";
import { Logger, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
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
import { SignInController } from "./sign-in/sign-in.controller";
import { SignInModule } from "./sign-in/sign-in.module";
import { SignInService } from "./sign-in/sign-in.service";
import { TrainingController } from "./training/training.controller";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env.production",
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT as unknown as number,
        db: process.env.REDIS_DB as unknown as number,
        password: process.env.REDIS_PASSWORD,
      },
    }),
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
    SignInModule,
    BullModule.registerQueue({ name: "email" }),
    RootModule,
    LdapModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    TrainingService,
    SignInService,
    EmailService,
    RootService,
    GoogleService,
    Logger,
  ],
  controllers: [SignInController, RootController, TrainingController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const csrfExclusions = this.getCsrfExclusions();

    consumer
      .apply(CsrfMiddleware)
      .exclude(...csrfExclusions)
      .forRoutes({ path: "*", method: RequestMethod.ALL });

    consumer.apply(IdempotencyMiddleware).forRoutes({ path: "*", method: RequestMethod.POST });
  }

  private getCsrfExclusions(): { path: string; method: RequestMethod }[] {
    console.log("Env CSRF_EXCLUDE_ROUTES:", process.env.CSRF_EXCLUDE_ROUTES);

    const routes = process.env.CSRF_EXCLUDE_ROUTES || "v1/authentication/login,POST;v1/authentication/refresh,POST";
    const exclusions = routes.split(";").map((route) => {
      const [path, method] = route.split(",");
      return { path, method: RequestMethod[method as keyof typeof RequestMethod] };
    });

    console.log("Generated CSRF Exclusions:", exclusions);
    return exclusions;
  }


}
