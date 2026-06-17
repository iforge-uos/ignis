import e from "@packages/db/edgeql-js";
import * as z from "zod";
import type { Filament, PrinterConfig } from "@/lib/printers/types";
import { filamentSlotSchema } from "@/lib/printers/utils";
import { printing } from "@/orpc";
import { printers, printManager } from "@/printing";

const filamentErrors = {
  NOT_AN_AMS_PRINTER: {
    status: 400,
    message: "This action is only valid for multi-filament (AMS) printers",
  },
  SINGLE_SLOT_ONLY: {
    status: 400,
    message: "This action is only valid for single-filament printers",
  },
  SLOT_REQUIRED: {
    status: 400,
    message: "A slot payload is required when uploading a single-filament change",
  },
} as const;

export const filament = printing
  .errors(filamentErrors)
  .route({ method: "PATCH", path: "/filament" })
  .input(
    z.object({
      name: z.string().min(1),
      upload: z.boolean(),
      slot: filamentSlotSchema
        .omit({ slot_id: true })
        .refine((s) => s.nozzle_temp_max > s.nozzle_temp_min, {
          message: "nozzle_temp_max must be greater than nozzle_temp_min",
          path: ["nozzle_temp_max"],
        })
        .optional(),
    }),
  )
  .output(z.object({ slots: z.array(filamentSlotSchema) }))
  .handler(async ({ input: { name, upload, slot }, errors, context: { db } }) => {
    const record = printers.get(name);
    if (!record) throw errors.PRINTER_NOT_FOUND({ data: { name } });

    let config: PrinterConfig | null;
    try {
      config = printManager.getConfig(name);
    } catch {
      throw errors.PRINTER_NOT_FOUND({ data: { name } });
    }
    if (!config) throw errors.PRINTER_NOT_FOUND({ data: { name } });

    const isAms = config.queue === "MULTI" || config.filament.length > 1;

    let slots: Filament[];
    if (upload) {
      if (isAms) throw errors.SINGLE_SLOT_ONLY();
      if (!slot) throw errors.SLOT_REQUIRED();
      const updated: Filament = {
        slot_id: config.filament[0]?.slot_id ?? 0,
        ...slot,
      };
      await printManager.updateSlot(name, updated.slot_id, updated);
      slots = [updated];
    } else {
      if (!isAms) throw errors.NOT_AN_AMS_PRINTER();
      slots = await printManager.syncSlots(name);
    }

    const filament = slots.map(({ slot_id, ...f }) => f);
    await e
      .update(e.printing.Printer, () => ({
        filter_single: { id: record.id },
        set: { filament },
      }))
      .run(db);

    return { slots };
  });
