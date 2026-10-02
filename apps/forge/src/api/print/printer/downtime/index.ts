import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { downtimeSchema, downtimeShape } from "@/lib/printers/utils";
import { printing } from "@/orpc";
import { nameRoutes } from "./$name";

export const all = printing
  .route({ method: "GET", path: "/" })
  .output(z.array(downtimeSchema))
  .handler(async ({ context: { db } }) => {
    return await e
      .select(e.printing.Downtime, (downtime) => ({
        ...downtimeShape(downtime),
        filter: e.op("not", downtime.has_finished),
      }))
      .run(db);
  });

export const downtimeRoutes = printing.prefix("/downtime").router({
  ...nameRoutes,
  all,
});
