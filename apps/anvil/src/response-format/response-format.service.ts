import { HttpException, Injectable } from "@nestjs/common";

@Injectable()
export class ResponseFormatService {
  formatResponse(status: number, data?: any, error?: any) {
    if (status >= 200 && status < 400) {
      return data;
    } else {
      if (error instanceof HttpException) {
        return {
          message: error.message.trimEnd() || "An unexpected error occurred",
          errors: error.cause ? [error.cause] : [],
        };
      }
      return {
        message: error?.message?.trimEnd() || "An unexpected error occurred",
        errors: error?.errors || [],
      };
    }
  }
}
