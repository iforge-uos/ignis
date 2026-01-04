import { Temporal } from "@js-temporal/polyfill";
import { EventPublisher } from "@orpc/client";
import { createClient } from "@packages/db/edgeql-js";
import { $Listenable, $ListenableWithChanges } from "@packages/db/edgeql-js/modules/default";
import { $expr_PathNode, ObjectType, pointerToTsType, TypeSet } from "@packages/db/edgeql-js/reflection";
import z from "zod";
import env from "./lib/env";

// https://accounts.google.com/v3/signin/accountchooser?client_id=766658830983-f4lsr0rjebuabe1mjlqe9oagfouikkfg.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Flocalhost%3A10705%2Fdb%2Fmain%2Fext%2Fauth%2Fcallback&response_type=code&scope=openid+profile+email+&state=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NjY5NDk3NzYsImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0OjEwNzA1L2RiL21haW4vZXh0L2F1dGgiLCJpYXQiOjE3NjY5NDk0NzYsIm5iZiI6MTc2Njk0OTQ0NiwicHJvdmlkZXIiOiJidWlsdGluOjpvYXV0aF9nb29nbGUiLCJyZWRpcmVjdF90b19vbl9zaWdudXAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvYXBpL2F1dGgvY29tcGxldGU_aXNTaWduVXA9dHJ1ZSIsImNoYWxsZW5nZSI6Im8xTDY1UXNrWHVSOTZObDlRakI0RTF5ZnhyZTFkOHdXU1JERTNENWdFSTAiLCJyZWRpcmVjdF90byI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcGkvYXV0aC9jb21wbGV0ZSIsInJlZGlyZWN0X3VyaSI6Imh0dHBzOi8vbG9jYWxob3N0OjEwNzA1L2RiL21haW4vZXh0L2F1dGgvY2FsbGJhY2sifQ.dRL1yVAw0FJZQ2_17lxcadOzZPZ1CSZ2ewyDkyWwOjM&dsh=S-435723545%3A1766949477235674&o2v=2&service=lso&flowName=GeneralOAuthFlow&opparams=%253F&continue=https%3A%2F%2Faccounts.google.com%2Fsignin%2Foauth%2Fconsent%3Fauthuser%3Dunknown%26part%3DAJi8hAM0YOQp5uFhN56GY-l8JHubRHzyOJxbRadoETtsPGk_bRumbuXQBqI5RVQAoPmz1lXqQW27Ef19T8kWAz865qD9q1VqvnJhPyuPKXHixyHrZN-NgdUPCYqqwywO4sbtQm-H2MBxA3fPca4mdD6HKbq_cKvfahSohmQet4ZyBLJYoIBgkol8nxkoqjuOMkoocEzDU6LCyZwAUEnWaHNu8V1XUjsovgBwF4VjdCEQCY78g-ShJDizszQXJ85NQI_7XT1_YZQd-ZluQMLZbfO5ihI4s_Lc2yeNfYRPZejMo4aqiqESsXapRJll5yL0waTrTrU_s2yVMA2kr3Gvnp0Ae-JQqcgI2jPd_nFMVNHx0CZYG-DsgNMLVePKJCBpkLX5iI-_0wLoMjBbtPKhFte6uf3IAjoT4f65y2Q2buBR_tFWX7uqNk0onfU85BYkyveZUNiQExTCkc08cPBUKXyheODaQAY4gw%26flowName%3DGeneralOAuthFlow%26as%3DS-435723545%253A1766949477235674%26client_id%3D766658830983-f4lsr0rjebuabe1mjlqe9oagfouikkfg.apps.googleusercontent.com%26requestPath%3D%252Fsignin%252Foauth%252Fconsent%23&app_domain=https%3A%2F%2Flocalhost%3A10705
// https://accounts.google.com/v3/signin/accountchooser?client_id=766658830983-f4lsr0rjebuabe1mjlqe9oagfouikkfg.apps.googleusercontent.com&flowName=GeneralOAuthFlow
const client = createClient({ branch: "main", tlsSecurity: "insecure" })
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

