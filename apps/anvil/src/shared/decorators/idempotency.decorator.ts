import { SetMetadata } from "@nestjs/common";

export const IDEMPOTENCY_CACHE_KEY = "idempotency_cache";

export const IdempotencyCache = (durationInSeconds = 3600) => SetMetadata(IDEMPOTENCY_CACHE_KEY, durationInSeconds);
