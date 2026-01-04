import { Temporal } from "@js-temporal/polyfill";
import type { StandardRPCCustomJsonSerializer } from "@orpc/client/standard";
import { createSerializationAdapter } from "@tanstack/react-router";

function* count(start = 0, step = 1) {
  let n = start;
  while (true) {
    yield n;
    n += step;
  }
}

const TYPE_COUNTER = count(100);

interface TemporalLike {
  toJSON(): string;
}

type TemporalConstructor<T extends TemporalLike> = {
  from(value: string | Record<string, unknown>): T;
};

function createSerializer<T extends TemporalLike>(
  temporalType: TemporalConstructor<T> & Function
): StandardRPCCustomJsonSerializer {
  return {
    type: TYPE_COUNTER.next().value as number,
    condition: (data: any) => data instanceof temporalType,
    serialize: (data: T) => data.toJSON(),
    deserialize: (value: string | Record<string, unknown>): T => temporalType.from(value),
  };
}

function createTanstackSerializer<T extends TemporalLike>(
  temporalType: TemporalConstructor<T> & Function
) {
  return createSerializationAdapter({
    key: temporalType.name,
    test: (data: any): data is T => data instanceof temporalType,
    toSerializable: (data: T) => data.toJSON(),
    fromSerializable: (value: string | Record<string, unknown>): T => temporalType.from(value),
  });
}

export default [
  createSerializer(Temporal.Duration),
  createSerializer(Temporal.PlainDate),
  createSerializer(Temporal.Instant),
  createSerializer(Temporal.ZonedDateTime),
] satisfies StandardRPCCustomJsonSerializer[];

export const tanstackSerialisers = [
  createTanstackSerializer(Temporal.Duration),
  createTanstackSerializer(Temporal.PlainDate),
  createTanstackSerializer(Temporal.Instant),
  createTanstackSerializer(Temporal.ZonedDateTime),
];
