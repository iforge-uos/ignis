import e from "@packages/db/edgeql-js";
import { z } from "zod";
import { auth, pub, rep } from "@/orpc";
import { SkewShape } from "@/lib/utils/queries";

export const get = rep
  .route({ method: "GET", path: "/" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .assert_exists(
        e.select(e.shop.Item, (item) => ({
          filter_single: { id },
          ...e.shop.Item["*"],
          skews: SkewShape,
          tools: e.tools.Tool["*"],
        })),
      )
      .run(db),
  );

export const update = rep
  .route({ method: "PATCH", path: "/" })
  .input(
    z
      .object({
        name: z.string(),
        price: z.number(),
        icon_url: z.string(),
        till_id: z.number(),
      })
      .partial()
      .extend({ id: z.uuid() }),
  )
  .handler(async ({ input: { id, ...rest }, context: { db } }) =>
    e
      .select(
        e.assert_exists(
          e.update(e.shop.Item, () => ({
            filter_single: { id },
            set: rest,
          })),
        ),
      )
      .run(db),
  );

export const idRouter = auth.prefix("/{id}").router({
  get,
  update,
  // purchasse
});
