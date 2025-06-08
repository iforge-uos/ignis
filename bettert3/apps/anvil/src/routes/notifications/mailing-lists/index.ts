import { auth } from "@/router";
import e from "@db/edgeql-js";
import { z } from "zod/v4";
import { idRouter } from "./$id";

export const all = auth
  .route({ path: "/" })
  .input(z.object({ include_subscribers: z.boolean().optional() }))
  .handler(async ({ context: { db }, input: { include_subscribers } }) =>
    e
      .assert_exists(
        e.select(e.notification.MailingList, () => ({
          subscribers: include_subscribers,
          id: true,
          name: true,
          description: true,
          updated_at: true,
          created_at: true,
        })),
      )
      .run(db),
  );

export const mailingListRouters = auth.prefix("/mailing-lists").router({
  all,
  ...idRouter,
});
