import { Injectable, NestMiddleware, BadRequestException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ErrorCodes } from "@/shared/constants/ErrorCodes";

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
      const csrfToken = req.cookies["csrf_token"];
      const csrfHeader = req.headers["x-csrf-token"];

      if (!csrfToken || csrfToken !== csrfHeader) {
        throw new BadRequestException({
          message: `Invalid CSRF Token. Try and reauthenticate?`,
          code: ErrorCodes.csrf_error,
        });
      }
    }
    next();
  }
}
