// middleware/idempotency.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { Redis } from "ioredis";

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT as unknown as number,
      db: process.env.REDIS_DB as unknown as number,
      password: process.env.REDIS_PASSWORD,
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.method === "POST") {
      const idempotencyKey = req.header("X-Idempotency-Key");
      if (idempotencyKey) {
        const cachedResponse = await this.redis.get(idempotencyKey);
        if (cachedResponse) {
          res.send(JSON.parse(cachedResponse));
          return;
        }
        res.locals.idempotencyKey = idempotencyKey;
      }
    }
    next();
  }
}
