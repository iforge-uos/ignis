import e from "@packages/db/edgeql-js";
import { printer_status_FailureReasonSchema } from "@packages/db/zod/modules/printing";
import type { Executor } from "gel";
import * as z from "zod";
import { datetimeOut, printerStatusSchema } from "@/lib/printers/utils";
import { printing } from "@/orpc";
import { printers, printManager } from "@/printing";
import { config } from "./config";
import { connection } from "./connection";

const failureOutput = z.object({
  reason: printer_status_FailureReasonSchema,
  note: z.string(),
});

const statusOutput = z.object({
  status: printerStatusSchema,
  down_until: datetimeOut.nullable(),
  failure: failureOutput.nullable(),
});

const DISABLED_STATUS = "printing::printer_status::Disabled";
const FAILED_STATUS = "printing::printer_status::Failed";

async function storedState(db: Executor, id: string) {
  const printer = await e
    .select(e.printing.Printer, (p) => ({
      status_type: p.status.__type__.name,
      end_time: p.status.is(e.printing.printer_status.Disabled).end_time,
      reason: p.status.is(e.printing.printer_status.Failed).reason,
      note: p.status.is(e.printing.printer_status.Failed).note,
      filter_single: { id },
    }))
    .run(db);

  return {
    disabled: printer?.status_type === DISABLED_STATUS,
    failed: printer?.status_type === FAILED_STATUS,
    down_until: printer?.end_time ?? null,
    reason: printer?.reason ?? null,
    note: printer?.note ?? null,
  };
}

export const status = printing
  .route({ method: "GET", path: "/" })
  .input(z.object({ name: z.string().min(1) }))
  .output(statusOutput)
  .handler(async ({ input: { name }, errors, context: { db } }) => {
    const record = printers.get(name);
    if (!record) throw errors.PRINTER_NOT_FOUND({ data: { name } });

    const stored = await storedState(db, record.id);
    if (stored.failed) {
      return {
        status: { state: "error" as const },
        down_until: null,
        failure: { reason: stored.reason ?? "OTHER", note: stored.note ?? "" },
      };
    }

    if (!printManager.Printers.includes(name)) {
      if (stored.disabled)
        return { status: { state: "disabled" as const }, down_until: stored.down_until, failure: null };
      return { status: { state: "disconnected" as const }, down_until: null, failure: null };
    }

    const status = await printManager.getStatus(name);
    if (status.state !== "disabled") return { status, down_until: null, failure: null };

    return { status, down_until: stored.down_until, failure: null };
  });

export const statusRouter = printing.prefix("/status").router({
  config,
  connection,
  status,
});
