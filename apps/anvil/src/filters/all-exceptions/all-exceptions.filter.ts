import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";

import { ResponseFormatService } from "@/response-format/response-format.service";
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly responseFormatService: ResponseFormatService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const formattedResponse = this.responseFormatService.formatResponse(
      status,
      null,
      exception,
    );

    response.status(status).json(formattedResponse);
  }
}
