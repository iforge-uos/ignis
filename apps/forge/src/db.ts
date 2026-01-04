import { Temporal } from "@js-temporal/polyfill";
import { EventPublisher } from "@orpc/client";
import { createClient } from "@packages/db/edgeql-js";
import { $Listenable, $ListenableWithChanges } from "@packages/db/edgeql-js/modules/default";
import { $expr_PathNode, ObjectType, pointerToTsType, TypeSet } from "@packages/db/edgeql-js/reflection";
import z from "zod";
import env from "./lib/env";

const MICROSECONDS_SINCE_2000 = 946684800000000n;

const client = createClient({ branch: "main", tlsSecurity: process.env.NODE_ENV === "development" ? "insecure" : "default"})
  .withGlobals(env.db.globals)
  .withConfig({ apply_access_policies: false })
  .withCodecs({
    // if you're ever wondering why data seems truncated blame the discrepancy below
    "std::datetime": {
      toDatabase(data: Temporal.ZonedDateTime) {
        return data.epochNanoseconds * 1000n;
      },
      fromDatabase(data: bigint) {
        return new Temporal.ZonedDateTime(data * 1000n, "UTC");
      },
    },
    "std::duration": {
      toDatabase(data: Temporal.Duration) {
        return BigInt(data.total("microseconds"));
      },
      fromDatabase(data: bigint): Temporal.Duration {
        return Temporal.Duration.from({ microseconds: Number(data) });
      },
    },
    "cal::local_date": {
      toDatabase(data: Temporal.PlainDate): [number, number, number] {
        return [data.year, data.month, data.day];
      },
      fromDatabase(data: [number, number, number]): Temporal.PlainDate {
        const [year, month, day] = data;
        return Temporal.PlainDate.from({ year, month, day });
      },
    },
    "cal::local_datetime": {
      toDatabase(data: Temporal.PlainDateTime) {
        // gel stores local_datetime as microseconds since 2000-01-01
        const instant = data.toZonedDateTime("UTC").toInstant();
        const epochMicros = instant.epochNanoseconds / 1000n;
        return epochMicros - MICROSECONDS_SINCE_2000;
      },
      fromDatabase(data: bigint): Temporal.PlainDateTime {
        const epochNanos = (data + MICROSECONDS_SINCE_2000) * 1000n;
        const instant = Temporal.Instant.fromEpochNanoseconds(epochNanos);
        return instant.toZonedDateTimeISO("UTC").toPlainDateTime();
      },
    },
  });

// export const auth = createExpressAuth(client, {
//   baseUrl: "http://127.0.0.1:3000",
//   // authCookieName: "",
// });

// listeners
type Listenable = $Listenable["__polyTypenames__"];
type ListenableWithChangesNames = $ListenableWithChanges["__polyTypenames__"];

export type UpdatedFields<
  T extends {
    __name__: ListenableWithChangesNames;
  },
> = T extends ObjectType<string, infer PointersT>
  ? {
      [K in keyof PointersT]: K extends
        | "__type__" // __type__ and link properties are not returned by {**}
        | `<${string}`
        | "id" // id is known readonly, could probably exclude more here but this is good enough for me
        ? never
        : { new: pointerToTsType<PointersT[K]>; old: pointerToTsType<PointersT[K]> } | undefined;
    }
  : never;

export const DB_LISTENERS = new EventPublisher<Record<string, z.infer<typeof Listenable>>>();

export function onInsert<U extends ObjectType<Listenable | ListenableWithChangesNames>>(
  type: $expr_PathNode<TypeSet<U>>,
  cb: (arg0: { id: string }) => Promise<void>,
) {
  return DB_LISTENERS.subscribe(`${type.__element__.__name__ as Listenable}$insert`, cb as any);
}

export function onUpdate<U extends ObjectType<Listenable>>(
  type: $expr_PathNode<TypeSet<U>>,
  cb: (arg0: { id: string }) => Promise<void>,
): () => void;
export function onUpdate<U extends ObjectType<ListenableWithChangesNames>>(
  type: $expr_PathNode<TypeSet<U>>,
  cb: (arg0: UpdatedFields<U>) => Promise<void>,
): () => void;
export function onUpdate(type: $expr_PathNode, cb: (arg0: any) => Promise<void>) {
  return DB_LISTENERS.subscribe(`${type.__element__.__name__}$update`, cb as any);
}

export function onDelete<U extends ObjectType<Listenable | ListenableWithChangesNames>>(
  type: $expr_PathNode<TypeSet<U>>,
  cb: (arg0: { id: string }) => Promise<void>,
) {
  return DB_LISTENERS.subscribe(`${type.__element__.__name__ as Listenable}$delete`, cb as any);
}

const _Base = z.object({
  type: z.string(),
  id: z.uuid(),
});

export const Listenable = _Base.and(
  z
    .object({
      action: z.literal(["insert", "delete"]),
    })
    .or(
      z.object({
        action: z.literal("update"),
        fields_changed: z.record(z.string(), z.object({ old: z.any(), new: z.any() })).optional(),
      }),
    ),
);


export default client;

