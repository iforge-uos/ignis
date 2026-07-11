import e from "@packages/db/edgeql-js";
import type { Executor } from "gel";
import * as z from "zod";
import { datetimeOut, printerStatusSchema } from "@/lib/printers/utils";
import { printing } from "@/orpc";
import { printers, printManager } from "@/printing";
import { config } from "./config";
import { connection } from "./connection";

const statusOutput = z.object({
  status: printerStatusSchema,
  down_until: datetimeOut.nullable(),
});

const DISABLED_STATUS = "printing::printer_status::Disabled";

async function disabledState(db: Executor, id: string) {
  const printer = await e
    .select(e.printing.Printer, (p) => ({
      status_type: p.status.__type__.name,
      end_time: p.status.is(e.printing.printer_status.Disabled).end_time,
      filter_single: { id },
    }))
    .run(db);

  return {
    disabled: printer?.status_type === DISABLED_STATUS,
    down_until: printer?.end_time ?? null,
  };
}

export const status = printing
  .route({ method: "GET", path: "/" })
  .input(z.object({ name: z.string().min(1) }))
  .output(statusOutput)
  .handler(async ({ input: { name }, errors, context: { db } }) => {
    const record = printers.get(name);
    if (!record) throw errors.PRINTER_NOT_FOUND({ data: { name } });

    if (!printManager.Printers.includes(name)) {
      const { disabled, down_until } = await disabledState(db, record.id);
      if (disabled) return { status: { state: "disabled" as const }, down_until };
      return { status: { state: "disconnected" as const }, down_until: null };
    }

    const status = await printManager.getStatus(name);
    if (status.state !== "disabled") return { status, down_until: null };

    const { down_until } = await disabledState(db, record.id);
    return { status, down_until };
  });

export const statusRouter = printing.prefix("/status").router({
  config,
  connection,
  status,
});
