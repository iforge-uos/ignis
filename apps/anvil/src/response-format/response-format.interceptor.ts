import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResponseFormatService } from "@/response-format/response-format.service";

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  constructor(private readonly responseFormatService: ResponseFormatService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const status = response.statusCode;
        return this.responseFormatService.formatResponse(status, data);
      }),
    );
  }
}
