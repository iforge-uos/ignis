import e from "@packages/db/edgeql-js";
import { UpdateMailingListSchema } from "@packages/db/zod/modules/notification";
import z from "zod";
import { auth, deskOrAdmin } from "@/orpc";

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

const update = deskOrAdmin
  .route({ method: "PATCH", path: "/" })
  .input(UpdateMailingListSchema.extend({ id: z.uuid() }))
  .handler(async ({ context: { db }, input }) =>
    e
      .update(e.notification.MailingList, () => ({
        filter_single: { id: input.id },
        set: input,
      }))
      .run(db),
  );

const remove = deskOrAdmin
  .route({ method: "DELETE", path: "/" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ context: { db }, input }) =>
    e
      .delete(e.notification.MailingList, () => ({
        filter_single: { id: input.id },
      }))
      .run(db),
  );

export const idRouter = auth.prefix("/{id}").router({ update, remove, get });
