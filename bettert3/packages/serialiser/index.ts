import { Temporal } from "@js-temporal/polyfill";
import type { StandardRPCCustomJsonSerializer } from "@orpc/client";
import { Duration, LocalDateTime } from "gel";

function* count(start = 0, step = 1) {
  let n = start;
  while (true) {
    yield n;
    n += step;
  }
}

const TYPE_COUNTER = count(100);

// Type for a constructor of a class T
type Constructor<T = any> = new (...args: any[]) => T;

interface ToJSONable {
  toJSON(): string;
}

type FromableConstructor<TInstance extends ToJSONable> = Constructor<TInstance> & {
  from(value: string | Record<string, unknown>): TInstance;
};

function createSerializer<
  PInstance extends ToJSONable, // Instance type for primaryType
  TInstance extends ToJSONable, // Instance type for temporalEquivalentType
>(primaryType: Constructor<PInstance>, temporalType: FromableConstructor<TInstance>): StandardRPCCustomJsonSerializer {
  return {
    type: TYPE_COUNTER.next().value as number, // Ensure type is number
    condition: (data: any) => data instanceof primaryType || data instanceof temporalType,
    serialize: (data: PInstance | TInstance) => data.toJSON(),
    deserialize: (value: string | Record<string, unknown>): TInstance => temporalType.from(value),
  };
}

export default [
  createSerializer(Duration as any, Temporal.Duration),
  createSerializer(LocalDateTime as any, Temporal.Instant),
  createSerializer(Date, Temporal.ZonedDateTime),
] satisfies StandardRPCCustomJsonSerializer[];
