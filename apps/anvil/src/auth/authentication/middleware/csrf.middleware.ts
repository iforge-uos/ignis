import { ErrorCodes } from "@/shared/constants/ErrorCodes";
import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    use(req: Request, _res: Response, next: NextFunction): void {
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            const csrfToken = req.cookies.csrf_token;
            const csrfHeader = req.headers['x-csrf-token'];

            if (!csrfToken || csrfToken !== csrfHeader) {
                throw new UnauthorizedException({
                    message: "Invalid CSRF Token. Try and reauthenticate?",
                    code: ErrorCodes.csrf_error,
                });
            }
        }

        next();
    }
}