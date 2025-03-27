import { auth } from "@/router";
import e from "@dbschema/edgeql-js";
import { z } from "zod";

export const get = auth
  .route({ path: "/{id}" })
  .input(z.object({ id: z.string().uuid() }))
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
