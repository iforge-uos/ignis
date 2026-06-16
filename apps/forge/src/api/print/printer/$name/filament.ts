import e from "@packages/db/edgeql-js";
import { MaterialSchema } from "@packages/db/zod/modules/printing";
import * as z from "zod";
import type { FilamentSlot, PrinterConfig } from "@/lib/printers/types";
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
      slot: z
        .object({
          material: MaterialSchema,
          colour: z.string().length(8),
          nozzle_temp_min: z.int().positive(),
          nozzle_temp_max: z.int().positive(),
          bed_temp: z.int().positive(),
        })
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

    const isAms = config.queue === "MULTI" || config.slots.length > 1;

    let slots: FilamentSlot[];
    if (upload) {
      if (isAms) throw errors.SINGLE_SLOT_ONLY();
      if (!slot) throw errors.SLOT_REQUIRED();
      const updated: FilamentSlot = {
        slotId: config.slots[0]?.slotId ?? 0,
        filamentType: slot.material,
        colour: slot.colour,
        nozzleTempMin: slot.nozzle_temp_min,
        nozzleTempMax: slot.nozzle_temp_max,
        bedTemp: slot.bed_temp,
      };
      await printManager.updateSlot(name, updated.slotId, updated);
      slots = [updated];
    } else {
      if (!isAms) throw errors.NOT_AN_AMS_PRINTER();
      slots = await printManager.syncSlots(name);
    }

    const filament_slots = slots.map((s) => ({
      material: s.filamentType,
      colour: s.colour,
      nozzle_temp_min: s.nozzleTempMin,
      nozzle_temp_max: s.nozzleTempMax,
      bed_temp: s.bedTemp,
    }));
    await e
      .update(e.printing.Printer, () => ({
        filter_single: { id: record.id },
        set: { filament_slots },
      }))
      .run(db);

    return { slots };
  });
