import e from "@packages/db/edgeql-js";
import { print_status_FailureReasonSchema } from "@packages/db/zod/modules/printing";
import jwt from "jsonwebtoken";
import * as z from "zod";
import env from "@/lib/env";
import { printing } from "@/orpc";
import { printers, printManager } from "@/printing";
import { PartialUserShape } from "@/lib/utils/queries";
import email from "@/email";

export const finish = printing
  .route({ method: "DELETE", path: "/finish" })
  .input(
    z.object({
      name: z.string().min(1),
      success: z.boolean().default(false),
      requeue: z.boolean().default(false),
      review: z.boolean().default(false),
      reason: print_status_FailureReasonSchema.optional(),
      message: z.string().min(1).optional(),
    }),
  )
  .handler(async ({ input: { name, success, requeue, review, reason, message }, context: { db, user }, errors }) => {
    if (!printers.has(name)) throw errors.PRINTER_NOT_FOUND({ data: { name } });
    if (!printManager.Printers.includes(name)) throw errors.PRINTER_DISCONNECTED();

    const status = await printManager.getStatus(name);
    if (status.state === "disconnected") throw errors.PRINTER_DISCONNECTED();

    const job = printManager.getActiveJob(name);
    if (!job) throw errors.PRINT_JOB_NOT_FOUND();

    try {
      await printManager.finishJob(name);
    } catch {
      throw errors.COMMAND_FAILED();
    }

    const record = await e
      .select(e.printing.PrintHistory, (h) => ({
        id: true,
        attempts: true,
        has_timelapse: true,
        author: e.assert_exists(e.assert_single(e.select(h["<on[is printing::Print]"].author, PartialUserShape))),
        filter_single: { id: e.uuid(job.uuid) },
      }))
      .run(db);
    if (!record) throw errors.PRINT_JOB_NOT_FOUND({ data: { id: job.uuid } });

    const history_id = record.id;
    const attempts = record.attempts + 1;
    const new_status = (() => {
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
        filter_single: { id: e.uuid(history_id) },
        set: { status: new_status, ...(requeue ? { attempts } : {}) },
      }))
      .run(db);

    if (record.has_timelapse) {
      void (async () => {
        try {
          const timelapse = await printManager.retrieveTimelapse(name, job.name);
          if (timelapse) {
            const access_token = jwt.sign({ sub: user.id, roles: user.roles.map((r) => r.id) }, env.auth.jwtSecret!, {
              expiresIn: "5m",
            });
            const form = new FormData();
            form.append("timelapse", new Blob([timelapse as unknown as BlobPart]), `${history_id}.mpg`);
            form.append("access_token", access_token);
            const upload = await fetch(`${env.cdn.url}/upload/timelapse/${history_id}`, { method: "POST", body: form });
            if (upload.ok) return;
          }
          throw new Error("Timelapse retrieval failed");
        } catch {
          await e
            .update(e.printing.PrintHistory, () => ({
              filter_single: { id: e.uuid(history_id) },
              set: { has_timelapse: false },
            }))
            .run(db);
        }
      })();
    }

    const printer_location = await e
      .assert_exists(
        e.select(e.printing.Printer, () => ({
          location: { name: true },
          filter_single: { id: printers.get(name)!.id },
        })),
      )
      .run(db);

    await email.sendPrintFinishEmail(record.author, {
      finished_at: new Date(),
      print_name: job.name,
      success,
      requeue,
      reason,
      attempt: attempts,
      location: printer_location.location.name,
    });
  });
