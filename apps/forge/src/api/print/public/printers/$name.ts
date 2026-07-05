import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { auth, ensurePrinters } from "@/orpc";
import type { PrinterStatus } from "@/lib/printers/types";
import {
  PRINTER_CONNECTION_ERRORS,
  printerSchema,
  publicStatusSchema,
  toFilamentSlots,
  toPublicStatus,
} from "@/lib/printers/utils";
import { printManager, printers } from "@/printing";

export const printer = auth
  .use(ensurePrinters)
  .errors(PRINTER_CONNECTION_ERRORS)
  .route({ method: "GET", path: "/{name}" })
  .input(z.object({ name: z.string().min(1) }))
  .output(z.object({ printer: printerSchema, status: publicStatusSchema }))
  .handler(async ({ input: { name }, errors, context: { db } }) => {
    const record = printers.get(name);
    if (!record) throw errors.PRINTER_NOT_FOUND({ data: { name } });

    const row = await e
      .select(e.printing.Printer, () => ({
        id: true,
        name: true,
        manufacturer: true,
        model: true,
        has_camera: true,
        filament: true,
        location: { name: true },
        total_print_mass: true,
        total_print_time: true,
        filter_single: { id: e.uuid(record.id) },
      }))
      .run(db);
    if (!row) throw errors.PRINTER_NOT_FOUND({ data: { name } });

    let status: PrinterStatus = { state: "disconnected" };
    if (printManager.Printers.includes(row.name)) {
      try {
        status = await printManager.getStatus(row.name);
      } catch {
        status = { state: "disconnected" };
      }
    }

    return {
      printer: { ...row, location: row.location.name, filament: toFilamentSlots(row.filament) },
      status: toPublicStatus(status),
    };
  });
