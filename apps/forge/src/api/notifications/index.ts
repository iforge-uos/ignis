import e from "@packages/db/edgeql-js";
import {allNotifications} from "@packages/db/queries/allNotifications.query"
import { CreateAuthoredNotificationSchema } from "@packages/db/zod/modules/notification";
import { auth, pub } from "@/orpc";
import { getTargets, idRouter, Targets } from "./$id";
import { mailingListRouters } from "./mailing-lists";
import email from "@/email";


export const all = auth.route({ path: "/" }).handler(async ({ context: { db } }) => allNotifications(db));

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

const send = pub.route({
  path: "/send",
}).handler(
  async () => {

  await email.sendQueuedEmail(
    { id: "", created_at: new Date(), ends_at: new Date(), notified_at: new Date(), user: {
      id: "",
      display_name: "James H-B",
      email: "jhilton-balfe1",
      username: "eik21jh",
      ucard_number: 0,
      created_at: new Date(),
      roles: []
    } },
    "MAINSPACE",
  );

    // await email.sendHtml()
  }
)

export const notificationsRouter = auth.prefix("/notifications").router({
  all,
  create,
  ...idRouter,
  mailingLists: mailingListRouters,
  send,
});
