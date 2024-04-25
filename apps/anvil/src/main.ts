import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from "nest-winston";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

import type { users } from "@ignis/types";
import * as Express from "express";
import * as winston from "winston";
import "winston-daily-rotate-file";
import { utilities as nestWinstonModuleUtilities } from "nest-winston/dist/winston.utilities";

declare global {
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  namespace Express {
    interface User extends users.User {}
  }
}

async function bootstrap() {
  // Setup Logger
  const instance = winston.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(winston.format.timestamp(), nestWinstonModuleUtilities.format.nestLike()),
      }),
      new winston.transports.DailyRotateFile({
        filename: "logs/anvil-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
    ],
  });
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance,
    }),
  });
  app.enableShutdownHooks();
  app.enableCors({
    origin: process.env.FRONT_END_URL as string,
    credentials: true,
  });
  app.use(cookieParser());
  // Options
  app.enableVersioning({
    defaultVersion: "1",
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());

  // Open API
  const options = new DocumentBuilder()
    .setTitle("iForge Anvil")
    .setDescription("iForge Anvil API")
    .setVersion("0.1")
    .addTag("iForge")
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("api", app, document);
  await app.listen(process.env.ANVIL_PORT || 3000);
}

bootstrap();
