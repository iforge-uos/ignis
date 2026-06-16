import { printing } from "@/orpc";
import { printManager, printers } from "@/printing";
import * as z from "zod";
import e from "@packages/db/edgeql-js";
import { printer_status_FailureReasonSchema } from "@packages/db/zod/modules/printing";

export const enable = printing
    .route({ method: "POST", path: "/enabled" })
    .input(z.object({ name: z.string().min(1) }))
    .handler(async ({ input: { name }, errors, context: { db } }) => {
        const record = printers.get(name);
        if (!record) throw errors.PRINTER_NOT_FOUND({ data: { name } });
        await e
            .update(e.printing.Downtime, (downtime) => ({
                filter: e.all(
                    e.set(
                        e.op(downtime.printer.name, "=", name),
                        downtime.has_started,
                        e.op("not", downtime.has_finished),
                    ),
                ),
                set: {
                    end_time: e.datetime_current(),
                    has_finished: true,
                },
            }))
            .run(db);

        if (printManager.isConnected(name)) printManager.enable(name);

        const status = printManager.isConnected(name)
            ? e.insert(e.printing.printer_status.Idle, {})
            : e.insert(e.printing.printer_status.Disconnected, {});
        await e
            .with(
                [status],
                e.select({
                    printer: e.update(e.printing.Printer, () => ({
                        filter_single: { id: record.id },
                        set: { status },
                    })),
                    audit: e.insert(e.printing.PrinterAuditEntry, {
                        printer: e.assert_exists(
                            e.select(e.printing.Printer, () => ({ filter_single: { id: record.id } })),
                        ),
                        status,
                    }),
                }),
            )
            .run(db);

        return { success: true };
    });

export const disable = printing
    .errors({
        END_TIME_IN_PAST: {
            status: 422,
            message: "end_time must be in the future",
            data: z.object({ end_time: z.string() }),
        },
    })
    .route({ method: "DELETE", path: "/enabled" })
    .input(z.object({
        name: z.string().min(1),
        disabled: z.object({
            end_time: z.iso.datetime().optional(),
            reason: z.string().min(1).optional(),
        }).optional(),
        failed: z.object({
            reason: printer_status_FailureReasonSchema.optional(),
            note: z.string().optional(),
        }).optional(),
    }))
    .handler(async ({ input: { name, disabled, failed }, errors, context: { db } }) => {
        const record = printers.get(name);
        if (!record) throw errors.PRINTER_NOT_FOUND({ data: { name } });
        if (disabled?.end_time && new Date(disabled.end_time) <= new Date()) {
            throw errors.END_TIME_IN_PAST({ data: { end_time: disabled.end_time } });
        }
        const end = disabled?.end_time ? e.cast(e.datetime, disabled.end_time) : undefined;
        await e
            .insert(e.printing.Downtime, {
                printer: e.assert_exists(
                    e.select(e.printing.Printer, () => ({ filter_single: { id: record.id } })),
                ),
                start_time: e.datetime_current(),
                has_started: true,
                ...(end ? { end_time: end } : {}),
                ...(disabled?.reason ? { reason: disabled.reason } : {}),
            })
            .run(db);
        const active = e.select(e.printing.Downtime, (d) => ({
            filter: e.op(
                e.op(d.printer.id, "=", e.uuid(record.id)),
                "and",
                e.op(e.op(d.has_started, "=", true), "and", e.op(d.has_finished, "=", false)),
            ),
        }));
        const state = await e
            .select({
                openEnded: e.op("exists", e.select(active, (a) => ({
                    filter: e.op("not", e.op("exists", a.end_time)),
                }))),
                latestEnd: e.max(active.end_time),
            })
            .run(db);
        const status = failed
            ? e.insert(e.printing.printer_status.Failed, {
                reason: e.cast(e.printing.printer_status.FailureReason, failed.reason ?? "OTHER"),
                note: failed.note ?? "",
            })
            : state.openEnded || !state.latestEnd
                ? e.insert(e.printing.printer_status.Disabled, {})
                : e.insert(e.printing.printer_status.Disabled, { end_time: state.latestEnd });
        await e
            .with(
                [status],
                e.select({
                    printer: e.update(e.printing.Printer, () => ({
                        filter_single: { id: record.id },
                        set: { status },
                    })),
                    audit: e.insert(e.printing.PrinterAuditEntry, {
                        printer: e.assert_exists(
                            e.select(e.printing.Printer, () => ({ filter_single: { id: record.id } })),
                        ),
                        status,
                    }),
                }),
            )
            .run(db);
        if (printManager.isConnected(name)) printManager.disable(name);
        return { success: true };
    });
