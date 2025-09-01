import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { auth } from "@/orpc";

// Get user's mailing list subscriptions
export const subscriptions = auth
  .route({ path: "/subscriptions" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ context: { db }, input: { id } }) =>
    e
      .select(e.notification.MailingList, (list) => ({
        id: true,
        name: true,
        description: true,
        created_at: true,
        updated_at: true,
        subscriber_count: e.count(list.subscribers),
        is_subscribed: e.op(
          e.select(e.users.User, () => ({
            filter_single: { id },
          })),
          "in",
          list.subscribers
        ),
      }))
      .run(db)
  );

// Subscribe to a mailing list
export const subscribe = auth
  .route({ method: "POST", path: "/subscribe" })
  .input(z.object({ id: z.uuid(), mailing_list_id: z.uuid() }))
  .handler(async ({ context: { db }, input: { id, mailing_list_id } }) =>
    e
      .update(e.users.User, () => ({
        filter_single: { id },
        set: {
          mailing_list_subscriptions: {
            "+=": e.select(e.notification.MailingList, () => ({
              filter_single: { id: mailing_list_id },
            })),
          },
        },
      }))
      .run(db)
  );

// Unsubscribe from a mailing list
export const unsubscribe = auth
  .route({ method: "POST", path: "/unsubscribe" })
  .input(z.object({ id: z.uuid(), mailing_list_id: z.uuid() }))
  .handler(async ({ context: { db }, input: { id, mailing_list_id } }) =>
    e
      .update(e.users.User, () => ({
        filter_single: { id },
        set: {
          mailing_list_subscriptions: {
            "-=": e.select(e.notification.MailingList, () => ({
              filter_single: { id: mailing_list_id },
            })),
          },
        },
      }))
      .run(db)
  );

export const mailingListRouter = auth.prefix("/mailing-lists").router({
  subscriptions,
  subscribe,
  unsubscribe,
});
