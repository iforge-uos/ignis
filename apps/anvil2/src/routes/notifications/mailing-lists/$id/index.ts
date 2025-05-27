import { auth } from "@/router";
import e from "@db/edgeql-js";
import { z } from "zod/v4";

export const get = auth
  .route({ path: "/" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ context: { db }, input: { id } }) =>
    e
      .assert_exists(
        e.select(e.notification.MailingList, () => ({
          ...e.notification.MailingList["*"],
          filter_single: { id },
        })),
      )
      .run(db),
  );

export const idRouter = auth.prefix("/{id}").router({ get });
