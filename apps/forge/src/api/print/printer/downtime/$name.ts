import { printing } from "@/orpc";
import { printers } from "@/printing"
import * as z from "zod"
import e from "@packages/db/edgeql-js";
import { downtimeError, downtimeSchema, downtimeShape } from "/src/lib/printers/utils";

export const add = printing
    .errors({
        ...downtimeError,
        INVALID_TIME_RANGE: {
            status: 422,
            message: "end_time must be after start_time",
            data: z.object({ msg: z.string() }),
        },
    })
    .route({ method: "POST", path: "/" })
    .input(z.object({
        name: z.string().min(1),
        start_time: z.iso.datetime(),
        end_time: z.iso.datetime().optional(),
        reason: z.string().min(1).optional(),
    }))
    .output(z.object({ id: z.uuid() }))
    .handler(async ({ input: { name, start_time, end_time, reason }, errors, context: { db } }) => {
        const printer = printers.get(name);
        if (!printer) throw errors.PRINTER_NOT_FOUND({ data: { name } });
        if (end_time && (new Date(end_time) <= new Date(start_time))) {
            throw errors.INVALID_TIME_RANGE({ data: { msg: "end_time must be after start_time" } });
        }
        return await e
            .insert(e.printing.Downtime, {
                printer: e.assert_exists(
                    e.select(e.printing.Printer, () => ({ filter_single: { id: printer.id } })),
                ),
                start_time: e.cast(e.datetime, start_time),
                ...(end_time ? { end_time: e.cast(e.datetime, end_time) } : {}),
                ...(reason ? { reason } : {}),
            })
            .run(db);
    });

export const remove = printing
    .errors(downtimeError)
    .route({ method: "DELETE", path: "/{id}" })
    .input(z.object({ name: z.string().min(1), id: z.uuid() }))
    .handler(async ({ input: { name, id }, errors, context: { db } }) => {
        const printer = printers.get(name);
        if (!printer) throw errors.PRINTER_NOT_FOUND({ data: { name } });
        const deleted = await e
            .delete(e.printing.Downtime, (downtime) => ({
                filter: e.op(
                    e.op(downtime.id, '=', e.uuid(id)),
                    'and',
                    e.op(
                        e.op(downtime.printer.id, '=', e.uuid(printer.id)),
                        'and',
                        e.op(downtime.has_started, '=', false),
                    ),
                ),
            }))
            .run(db);
        if (deleted.length < 1) {
            throw errors.DOWNTIME_NOT_FOUND({ data: { msg: `No not-yet-started downtime "${id}" found for printer "${name}"` } });
        }
        return { success: true };
    });

export const list = printing
    .errors(downtimeError)
    .route({ method: "GET", path: "/" })
    .input(z.object({ name: z.string().min(1), history: z.boolean().default(false) }))
    .output(z.array(downtimeSchema))
    .handler( async ({ input: { name, history }, errors, context: { db } }) => {
        const printer = printers.get(name);
        if (!printer) throw errors.PRINTER_NOT_FOUND({ data: { name: name }});
        const all = await e
            .select(e.printing.Downtime, (downtime) => ({
                ...downtimeShape(downtime),
                filter: e.op(
                    e.op(downtime.has_finished, '=', history),
                    'and',
                    e.op(downtime.printer.id, '=', e.uuid(printer.id)),
                ),
            }))
            .run(db);
        if (all.length < 1) throw errors.DOWNTIME_NOT_FOUND({ data: { msg: `No downtimes found for printer "${name}"` } });
        return all;
    });

export const nameRoutes = printing.prefix("/{name}").router({
    add,
    remove,
    list,    
});