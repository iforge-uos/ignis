import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";

declare global {
  interface Date {
    toTemporalInstant(): Temporal.Instant;
  }
}

Date.prototype.toTemporalInstant = toTemporalInstant;
