import e from "@packages/db/edgeql-js";
import { UpdateAuthoredNotificationSchema } from "@packages/db/zod/modules/notification";
import { z } from "zod";
import { exhaustiveGuard } from "@/lib/utils";
import { Target } from "@/lib/utils/notifications";
import { PartialUserShape } from "@/lib/utils/queries";
import { auth, eventsOrDeskOrAdmin } from "@/orpc";

export const get = auth
  .route({ path: "/" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ context: { db }, input }) =>
    e
      .select(e.notification.AuthoredNotification, () => ({
        filter_single: { id: input.id },
        ...e.notification.AuthoredNotification["*"],
        author: PartialUserShape,
        targets: (t) => ({
          __typename: t.__type__.name,
          id: true,
        }),
      }))
      .run(db),
  );

type SplitTarget<Target extends string> = Target extends `${infer Module}::${infer Type}` ? [Module, Type] : never;

export const Targets = z.map(Target, z.uuid().array().nullable().optional());

export const getTargets = (input: { targets: z.infer<typeof Targets> }) => {
  return e.set(
    ...input.targets.entries().map(([key, targetIds]) => {
      const [targetModule, targetType] = key.split("::") as SplitTarget<typeof key>;
      const shape = e.shape(e.BaseObject, (obj) => ({
        filter: e.op(obj.id, "in", e.cast(e.uuid, e.set(...targetIds!))),
      }));
      switch (targetModule) {
        case "default":
          return e.select(e[targetModule][targetType], shape);
        case "users":
          return e.select(e[targetModule][targetType], shape);
        case "event":
          return e.select(e[targetModule][targetType], shape);
        case "team":
          return e.select(e[targetModule][targetType], shape);
        case "notification":
          if (targetType === "AllUsers" || targetType === "AllReps") {
            return e.insert(e.notification[targetType], {}).unlessConflict();
          }
          return e.select(e[targetModule][targetType], shape);
        default:
          exhaustiveGuard(targetModule);
      }
    }),
  );
};

export const update = eventsOrDeskOrAdmin
  .route({ method: "PATCH", path: "/" })
  .input(UpdateAuthoredNotificationSchema.extend({ id: z.uuid(), targets: Targets }))
  .handler(async ({ context: { db }, input }) =>
    e
      .update(e.notification.AuthoredNotification, () => ({
        filter_single: { id: input.id },
        set: { ...input, targets: getTargets(input) },
      }))
      .run(db),
  );

export const remove = eventsOrDeskOrAdmin
  .route({ method: "DELETE", path: "/" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ context: { db }, input }) =>
    e
      .delete(e.notification.AuthoredNotification, () => ({
        filter_single: input,
      }))
      .run(db),
  );

export const acknowledge = auth
.route({ method: "POST", path: "/acknowledge" })
.input(z.object({ id: z.uuid() }))
.handler(async ({ input: { id }, context: { db, $user } }) =>
  e
    .assert_exists(
      e.update($user, () => ({
        set: {
          notifications: {
            "+=": e.assert_exists(
              e.select(e.notification.Notification, () => ({
                filter_single: { id },
                "@acknowledged_at": e.datetime_of_statement(),
              })),
            ),
          },
        },
      })),
    )
    .run(db),
);

export const idRouter = auth.prefix("/{id}").router({
  get,
  remove,
  update,
  acknowledge,
});
