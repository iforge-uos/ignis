import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { downtimeError, downtimeSchema, downtimeShape } from "@/lib/printers/utils";
import { printing } from "@/orpc";
import { nameRoutes } from "./$name";

export const all = printing
  .errors(downtimeError)
  .route({ method: "GET", path: "/" })
  .output(z.array(downtimeSchema))
  .handler(async ({ errors, context: { db } }) => {
    const all = await e
      .select(e.printing.Downtime, (downtime) => ({
        ...downtimeShape(downtime),
        filter: e.op("not", downtime.has_finished),
      }))
      .run(db);
    if (all.length < 1) throw errors.DOWNTIME_NOT_FOUND({ data: { msg: "No downtimes found for all printers" } });
    return all;
  });

export const downtimeRoutes = printing.prefix("/downtime").router({
  nameRoutes,
  all,
});
