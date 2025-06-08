import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
const OriginalRequest = globalThis.Request;

globalThis.Request = class Request extends OriginalRequest {
  constructor(input: RequestInfo, init?: RequestInit) {
    super(input, {
      ...init,
      duplex: "half",
    });
  }
};

declare global {
  interface Date {
    toTemporalInstant(): Temporal.Instant;
  }
}

Date.prototype.toTemporalInstant = toTemporalInstant;
