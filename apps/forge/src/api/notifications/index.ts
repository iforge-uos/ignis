import e from "@packages/db/edgeql-js";
import { CreateAuthoredNotificationSchema } from "@packages/db/zod/modules/notification";
import { PartialUserShape } from "@/lib/utils/queries";
import { auth } from "@/orpc";
import { getTargets, idRouter, Targets } from "./$id";
import { mailingListRouters } from "./mailing-lists";

export const all = auth.route({ path: "/" }).handler(async ({ context: { db } }) =>
  e
    .select(e.notification.AuthoredNotification, () => ({
      ...e.notification.AuthoredNotification["*"],
      author: PartialUserShape,
      targets: {
        id: true,
        ...e.is(e.users.User, { display_name: true }),
        ...e.is(e.team.Team, { name: true }),
        ...e.is(e.event.Event, { name: true }),
        ...e.is(e.notification.MailingList, { name: true }),
      },
    }))
    .run(db),
);

export const create = auth
  .route({
    path: "/",
    method: "POST",
  })
  .input(
    CreateAuthoredNotificationSchema.extend({
      targets: Targets,
    }),
  )
  .handler(async ({ context: { db, $user }, input }) =>
    e
      .select(
        e.insert(e.notification.AuthoredNotification, {
          ...input,
          delivery_methods: e.cast(e.notification.DeliveryMethod, e.set(...input.delivery_methods)),
          targets: getTargets(input),
          author: $user,
        }),
        // () => ({

        // }),
      )
      .run(db),
  );

export const notificationsRouter = auth.prefix("/notifications").router({
  all,
  create,
  ...idRouter,
  mailingLists: mailingListRouters,
});
