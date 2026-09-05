import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
import { implementation } from "regexp.escape";

declare global {
  interface Date {
    toTemporalInstant(): Temporal.Instant;
  }

  interface RegExp {
    escape: typeof implementation;
  }
}

(globalThis as unknown as { Temporal?: typeof Temporal }).Temporal ??= Temporal;
Date.prototype.toTemporalInstant = toTemporalInstant;
RegExp.prototype.escape = implementation;
