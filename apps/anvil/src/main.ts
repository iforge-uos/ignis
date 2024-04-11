import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./filters/all-exceptions/all-exceptions.filter";
import { ResponseFormatService } from "./response-format/response-format.service";

import type { users } from "@ignis/types";
import * as Express from "express";

declare global {
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  namespace Express {
    interface User extends users.User {}
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  app.useGlobalFilters(new AllExceptionsFilter(new ResponseFormatService()));

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
