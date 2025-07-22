import { deskOrAdmin, rep } from "@/orpc";
import e from "@packages/db/edgeql-js";
import * as z from "zod";

export const get = rep
  .route({ path: "/" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .select(e.sign_in.Reason, () => ({
        ...e.sign_in.Reason["*"],
        filter_single: { id },
      }))
      .run(db),
  );

export const remove = deskOrAdmin
  .route({ method: "DELETE", path: "/" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .assert_exists(
        e.delete(e.sign_in.Reason, () => ({
          filter_single: { id },
        })),
      )
      .run(db),
  );

export const idRouter = rep.prefix("/{id}").router({ get, remove });
