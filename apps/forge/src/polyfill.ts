import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
import {implementation} from "regexp.escape";
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

  interface RegExpConstructor {
    escape: typeof implementation;
  }
}

Date.prototype.toTemporalInstant = toTemporalInstant;
RegExp.prototype.escape = implementation;
