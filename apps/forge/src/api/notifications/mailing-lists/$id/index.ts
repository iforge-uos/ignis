import { auth } from "@/orpc";
import e from "@packages/db/edgeql-js";
import * as z from "zod";

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
