import { pub, rep, auth } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { z } from "zod";
import {idRouter } from "./$id"
import { SkewShape } from "@/lib/utils/queries";


export const all = pub.route({ method: "GET", path: "/" }).handler(async ({ context: { db } }) =>
  e
    .select(e.shop.Item, () => ({
      ...e.shop.Item["*"],
      skews: SkewShape,
    }))
    .run(db),
);

export const create = rep
  .route({ method: "POST", path: "/" })
  .input(
    z.object({
      name: z.string(),
      price: z.number(),
      icon_url: z.string(),
      supplier: z.string(),
      supplier_url: z.url(),
      skews: z.array(z.object({}))
    }),
  )
  .handler(async ({ input, context: { db } }) =>
    e
      .select(e.insert(e.shop.Item, input), () => ({
        ...e.shop.Item["*"],
      }))
      .run(db),
  );

export const itemsRouter = auth.prefix("/items").router({
    all,
    create,
    ...idRouter,
});
