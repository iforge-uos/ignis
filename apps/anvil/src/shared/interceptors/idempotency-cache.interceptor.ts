// interceptors/idempotency-cache.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { Redis } from "ioredis";

import { IDEMPOTENCY_CACHE_KEY } from "@/shared/decorators/idempotency.decorator";

@Injectable()
export class IdempotencyCacheInterceptor implements NestInterceptor {
  private readonly redis: Redis;
  private readonly logger = new Logger(IdempotencyCacheInterceptor.name);

  constructor(private readonly reflector: Reflector) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT as unknown as number,
      db: process.env.REDIS_DB as unknown as number,
      password: process.env.REDIS_PASSWORD,
    });
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const idempotencyCacheDuration = this.reflector.get<number>(IDEMPOTENCY_CACHE_KEY, context.getHandler());

    const idempotencyKey = context.switchToHttp().getRequest().header("X-Idempotency-Key");

    this.logger.debug(`Idempotency cache intercepted, key: ${idempotencyKey}`);

    if (idempotencyKey) {
      const lockKey = `lock:${idempotencyKey}`;
      const cachedResponse = await this.redis.get(idempotencyKey);

      if (cachedResponse) {
        this.logger.debug(`Returning cached response for key: ${idempotencyKey}`);
        return of(JSON.parse(cachedResponse));
      }

      try {
        // Acquire a lock for the idempotency key
        const lock = await this.redis.set(lockKey, "1", "EX", 10, "NX");

        if (!lock) {
          this.logger.debug(`Unable to acquire lock for key: ${idempotencyKey}, retrying...`);
          // If unable to acquire the lock, wait and retry
          await new Promise((resolve) => setTimeout(resolve, 100));
          return this.intercept(context, next);
        }

        this.logger.debug(`Processing request for key: ${idempotencyKey}`);
        return next.handle().pipe(
          tap(async (response) => {
            // Cache the response
            await this.redis.set(idempotencyKey, JSON.stringify(response), "EX", idempotencyCacheDuration);
            this.logger.debug(`Response cached for key: ${idempotencyKey}`);
          }),
        );
      } finally {
        // Release the lock
        await this.redis.del(lockKey);
        this.logger.debug(`Lock released for key: ${idempotencyKey}`);
      }
    } else {
      this.logger.debug("No idempotency key found, processing request normally");
    }

    return next.handle();
  }
}
