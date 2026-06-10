import { printing } from "@/orpc";
import { printManager, printers } from "@/printing";
import e from "@packages/db/edgeql-js";
import { print_status_FailureReasonSchema } from "@packages/db/zod/modules/printing";
import * as z from "zod";

export const finish = printing
    .route({ method: "DELETE", path: "/finish" })
    .input(z.object({
        name: z.string().min(1),
        success: z.boolean().default(false),
        requeue: z.boolean().default(false),
        review: z.boolean().default(false),
        reason: print_status_FailureReasonSchema.optional(),
        message: z.string().min(1).optional(),
    }))
    .handler(async ({ input: { name, success, requeue, review, reason, message }, context: { db }, errors }) => {
        if (!printers.has(name)) throw errors.PRINTER_NOT_FOUND({ data: { name } });
        if (!printManager.listPrinters().includes(name)) throw errors.PRINTER_DISCONNECTED();

        const status = await printManager.getStatus(name);
        if (status.state === "disconnected") throw errors.PRINTER_DISCONNECTED();
        if (status.state === "disabled") throw errors.PRINTER_DISABLED();

        const job = printManager.getActiveJob(name);
        if (!job) throw errors.PRINT_JOB_NOT_FOUND();

        try {
            await printManager.finishJob(name);
        } catch {
            throw errors.COMMAND_FAILED();
        }

        const record = await e
            .select(e.printing.PrintHistory, () => ({
                attempts: true,
                filter_single: { id: e.uuid(job.uuid) },
            }))
            .run(db);
        if (!record) throw errors.PRINT_JOB_NOT_FOUND({ data: { id: job.uuid } });

        const attempts = record.attempts + 1;
        const newStatus = (() => {
            if (success) return e.insert(e.printing.print_status.Complete, {});
            if (review) return e.insert(e.printing.print_status.UnderReview, {});
            if (requeue) {
                return attempts >= 3
                    ? e.insert(e.printing.print_status.UnderReview, {})
                    : e.insert(e.printing.print_status.Queued, {});
            }
            if (!reason) throw errors.INPUT_VALIDATION_FAILED();
            return e.insert(e.printing.print_status.Failed, { reason, note: message });
        })();

        await e
            .update(e.printing.PrintHistory, () => ({
                filter_single: { id: e.uuid(job.uuid) },
                set: { status: newStatus, ...(requeue ? { attempts } : {}) },
            }))
            .run(db);
    });