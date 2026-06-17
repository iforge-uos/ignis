import e from "@packages/db/edgeql-js";
import { CreateDowntimeSchema, QueueTypeSchema } from "@packages/db/zod/modules/printing";
import * as z from "zod";
import { filamentSlotSchema } from "@/lib/printers/utils";
import { printing } from "@/orpc";
import { printers, printManager } from "@/printing";
import { config } from "./config";
import { connection } from "./connection";

const printerStatusSchema = z.object({
  state: z.enum(["idle", "printing", "paused", "finished", "disconnected", "disabled", "error"]),
  current_job: z
    .object({
      print_job: z.object({
        job_id: z.string(),
        uuid: z.string(),
        name: z.string(),
        gcode_url: z.string(),
        filament: z.array(filamentSlotSchema),
        queue: QueueTypeSchema,
      }),
      name: z.string(),
      progress: z.number(),
      time_remaining: z.number(),
    })
    .optional(),
  temperature: z
    .object({
      nozzle: z.object({ current: z.number(), target: z.number() }),
      bed: z.object({ current: z.number(), target: z.number() }),
    })
    .optional(),
  errors: z.array(z.string()).optional(),
});

const statusOutput = z.object({
  status: printerStatusSchema,
  down_until: CreateDowntimeSchema.shape.end_time,
});

export const status = printing
  .route({ method: "GET", path: "/" })
  .input(z.object({ name: z.string().min(1) }))
  .output(statusOutput)
  .handler(async ({ input: { name }, errors, context: { db } }) => {
    const record = printers.get(name);
    if (!record) throw errors.PRINTER_NOT_FOUND({ data: { name } });

    if (!printManager.Printers.includes(name)) {
      const printer = await e
        .select(e.printing.Printer, () => ({
          status: { ...e.is(e.printing.printer_status.Disabled, { end_time: true }) },
          filter_single: { id: record.id },
        }))
        .run(db);
      if (printer && "end_time" in printer.status) {
        return { status: { state: "disabled" as const }, down_until: printer.status.end_time };
      }
      throw errors.PRINTER_DISCONNECTED();
    }

    const status = await printManager.getStatus(name);
    if (status.state !== "disabled") return { status, down_until: null };

    const printer = await e
      .select(e.printing.Printer, () => ({
        status: { ...e.is(e.printing.printer_status.Disabled, { end_time: true }) },
        filter_single: { id: record.id },
      }))
      .run(db);

    const down_until = printer && "end_time" in printer.status ? printer.status.end_time : null;
    return { status, down_until };
  });

export const statusRouter = printing.prefix("/status").router({
  config,
  connection,
  status,
});
