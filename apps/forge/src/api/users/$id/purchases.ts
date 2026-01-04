import { auth } from "@/orpc";
import z from "zod";
import e from "@packages/db/edgeql-js";

export const purchases = auth
  .route({ path: "/purchases" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) => {
    return e
      .select(e.shop.Purchase, (p) => ({
        id: true,
        collected_at: true,
        created_at: true,
        items: {id: true, price: true, wraps: true, skew: true},
        module: { id: true, name: true },
        filter_single: e.op(p.user.id, "=", e.uuid(id)),
      }))
      .run(db);
  });
