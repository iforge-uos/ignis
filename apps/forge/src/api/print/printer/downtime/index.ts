import { printing } from "@/orpc";
import * as z from "zod"
import e from "@packages/db/edgeql-js";
import { nameRoutes } from "./$name"
import { downtimeError, downtimeSchema, downtimeShape } from "/src/lib/printers/utils";

export const all = printing
    .errors(downtimeError)
    .route({ method: "GET", path: "/" })
    .output(z.array(downtimeSchema))
    .handler( async ({ errors, context: { db } }) => {
        const all = await e
            .select(e.printing.Downtime, (downtime) => ({
                ...downtimeShape(downtime),
                filter: e.op(downtime.has_finished, '=', false),
            }))
            .run(db);
        if (all.length < 1) throw errors.DOWNTIME_NOT_FOUND( { data: { msg: "No downtimes found for all printers"}});
        return all;
    });

export const downtimeRoutes = printing.prefix("/downtime").router({
    nameRoutes,
    all,
});