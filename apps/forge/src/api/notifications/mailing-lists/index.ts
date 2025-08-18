import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { auth, deskOrAdmin } from "@/orpc";
import { idRouter } from "./$id";
import { CreateMailingListSchema } from "@packages/db/zod/modules/notification";
import { search } from "./search";

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

const create = deskOrAdmin
  .route({ method: "POST", path: "/" })
  .input(CreateMailingListSchema)
  .handler(async ({ context: { db }, input }) => e.insert(e.notification.MailingList, input).run(db));

export const mailingListRouters = auth.prefix("/mailing-lists").router({
  all,
  create,
  search,
  ...idRouter,
});
