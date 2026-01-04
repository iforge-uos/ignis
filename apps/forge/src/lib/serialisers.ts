import { Temporal } from "@js-temporal/polyfill";
import type { StandardRPCCustomJsonSerializer } from "@orpc/client/standard";
import { createSerializationAdapter } from "@tanstack/react-router";
import { Duration, LocalDate, LocalDateTime } from "gel";

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

export interface ToJSONable {
  toJSON(): string;
}

type FromableConstructor<TInstance extends ToJSONable> = Constructor<TInstance> & {
  from(value: string | Record<string, unknown>): TInstance;
};

function createSerializer<
  PInstance extends ToJSONable,
  TInstance extends ToJSONable,
>(primaryType: Constructor<PInstance>, temporalType: FromableConstructor<TInstance>): StandardRPCCustomJsonSerializer {
  return {
    type: TYPE_COUNTER.next().value as number, // Ensure type is number
    condition: (data: any) => data instanceof primaryType || data instanceof temporalType,
    serialize: (data: PInstance | TInstance) => data.toJSON(),
    deserialize: (value: string | Record<string, unknown>): TInstance => temporalType.from(value),
  };
}

function createTanstackSerializer<
  PInstance extends ToJSONable,
  TInstance extends ToJSONable,
>(primaryType: Constructor<PInstance>, temporalType: FromableConstructor<TInstance>) {
  return createSerializationAdapter({
    key: typeof primaryType,
    test: (data: any): data is (PInstance | TInstance) => data instanceof primaryType || data instanceof temporalType,
    toSerializable: (data: PInstance | TInstance) => data.toJSON(),
    fromSerializable: (value: string | Record<string, unknown>): TInstance => temporalType.from(value),
  });
}

export default [
  createSerializer(Duration, Temporal.Duration),
  createSerializer(LocalDate as any, Temporal.PlainDate),
  createSerializer(LocalDateTime as any, Temporal.Instant),
  createSerializer(Date, Temporal.ZonedDateTime),
] satisfies StandardRPCCustomJsonSerializer[];

export const tanstackSerialisers = [
  createTanstackSerializer(Duration, Temporal.Duration),
  createTanstackSerializer(LocalDate as any, Temporal.PlainDate),
  createTanstackSerializer(LocalDateTime as any, Temporal.Instant),
  createTanstackSerializer(Date, Temporal.ZonedDateTime),
]
