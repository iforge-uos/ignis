import { Temporal } from "@js-temporal/polyfill";
import { createClient } from "@packages/db/edgeql-js";
import { $Listenable, $ListenableWithChanges } from "@packages/db/edgeql-js/modules/default";
import { $expr_PathNode, ObjectType, pointerToTsType, TypeSet } from "@packages/db/edgeql-js/reflection";
import Redis from "ioredis";
import z from "zod";
import env from "./lib/env";

const MICROSECONDS_SINCE_2000 = 946684800000000n;

const client = createClient({ branch: "main", tlsSecurity: "insecure", host: env.db.host, port: env.db.port, user: env.db.user, password: env.db.password })
  .withGlobals(env.db.globals)
  .withConfig({ apply_access_policies: true })
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
    "cal::local_time": {
      toDatabase(data: Temporal.PlainTime): bigint {
        const { hour, minute, second, millisecond, microsecond } = data;
        return BigInt(hour * 3600_000_000 + minute * 60_000_000 + second * 1_000_000 + millisecond * 1_000 + microsecond);
      },
      fromDatabase(data: bigint): Temporal.PlainTime {
        const hour = Number(data / 3600_000_000n);
        const minute = Number((data % 3600_000_000n) / 60_000_000n);
        const second = Number((data % 60_000_000n) / 1_000_000n);
        const millisecond = Number((data % 1_000_000n) / 1_000n);
        const microsecond = Number(data % 1_000n);

        return Temporal.PlainTime.from({ hour, minute, second, millisecond, microsecond });
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


type SubscriptionHandler = {
  channel: string;
  queue: z.infer<typeof Listenable>[];
  resolve: ((value?: unknown) => void) | null;
};

const redisConfig = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  db: Number.parseInt(env.redis.db ?? "0"),
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

const redisPublisher = new Redis(redisConfig);
const redisSubscriber = new Redis(redisConfig);

const subscriptions = new Map<string, SubscriptionHandler>();

// Setup message handler once
redisSubscriber.on("message", (channel: string, message: string) => {
  try {
    const listenable = Listenable.parse(JSON.parse(message));
    for (const [, handler] of subscriptions) {
      if (handler.channel === channel) {
        handler.queue.push(listenable);
        handler.resolve?.();
        handler.resolve = null;
      }
    }
  } catch (error) {
    console.error("Failed to process DB listener message", error);
  }
});

export async function publishDbListenable(listenable: z.infer<typeof Listenable>) {
  const message = JSON.stringify(listenable);
  await Promise.all([
    redisPublisher.publish(listenable.type, message),
    redisPublisher.publish(`${listenable.type}$${listenable.action}`, message),
  ]);
}

export async function* subscribeToDbListener(channel: Listenable | `${Listenable}$${"insert" | "update" | "delete"}`) {
  console.log("WTF is happening i dont get how it could error before here")
  const subscriptionId = `${channel}-${Math.random()}`;
  const handler: SubscriptionHandler = {
    channel,
    queue: [],
    resolve: null,
  };
  console.log("In subscribeToDbListener")

  subscriptions.set(subscriptionId, handler);
  await redisSubscriber.subscribe(channel);
  console.log("Subscribed to channel:", channel);
  try {
    while (true) {
      if (handler.queue.length > 0) {
        yield handler.queue.shift()!;
      } else {
        await new Promise((r) => (handler.resolve = r));
      }
    }
  } finally {
    subscriptions.delete(subscriptionId);
  }
}

export async function onInsert<U extends ObjectType<Listenable | ListenableWithChangesNames>>(
  type: $expr_PathNode<TypeSet<U>>,
  cb: (arg0: { id: string }) => Promise<void>,
) {
  const channel = `${type.__element__.__name__ as Listenable}$insert` as const;
  for await (const event of subscribeToDbListener(channel)) {
    if (event.type === (type.__element__.__name__ as Listenable)) {
      await cb(event as any);
    }
  }
}

export async function onUpdate<U extends ObjectType<Listenable>>(
  type: $expr_PathNode<TypeSet<U>>,
  cb: (arg0: { id: string }) => Promise<void>,
): Promise<void>;
export async function onUpdate<U extends ObjectType<ListenableWithChangesNames>>(
  type: $expr_PathNode<TypeSet<U>>,
  cb: (arg0: UpdatedFields<U>) => Promise<void>,
): Promise<void>;
export async function onUpdate(type: $expr_PathNode, cb: (arg0: any) => Promise<void>) {
  const channel = `${type.__element__.__name__ as Listenable}$update` as const;
  for await (const event of subscribeToDbListener(channel)) {
    if (event.type === type.__element__.__name__) {
      await cb(event as any);
    }
  }
}

export async function onDelete<U extends ObjectType<Listenable | ListenableWithChangesNames>>(
  type: $expr_PathNode<TypeSet<U>>,
  cb: (arg0: { id: string }) => Promise<void>,
) {
  const channel = `${type.__element__.__name__ as Listenable}$delete` as const;
  for await (const event of subscribeToDbListener(channel)) {
    if (event.type === (type.__element__.__name__ as Listenable)) {
      await cb(event as any);
    }
  }
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

