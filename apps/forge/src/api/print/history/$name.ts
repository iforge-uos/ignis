import { printing } from "@/orpc";
import * as z from "zod";
import { printers } from "@/printing";
import { historyErrors, historyOutput, printHistoryShape, toFilamentSlots } from "@/lib/printers/utils";
import e from "@packages/db/edgeql-js";



export const printer = printing
    .errors(historyErrors)
    .route({ method: "GET", path: "/{name}" })
    .input(z.object({ name: z.string().min(1) }))
    .output(historyOutput)
    .handler(async ({ input: { name }, errors, context: { db } }) => {
        const uuid = printers.get(name)?.id;
        if (!uuid) throw errors.PRINTER_NOT_FOUND({ data: { name } });
        const history = await e
            .select(e.printing.PrintHistory, (p) => ({
                ...printHistoryShape(p),
                filter: e.op(p.printer.id, "=", e.uuid(uuid)),
            }))
            .run(db);
        return history.map((h) => ({
            id: h.id,
            queue: h.queue,
            print: { ...h.print, filament: toFilamentSlots(h.print.filament) },
            printer: h.printer ?? undefined,
            attempts: h.attempts,
            timelapse: h.has_timelapse,
        }));
    })