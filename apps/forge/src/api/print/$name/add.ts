import type { printing } from "@packages/db/interfaces";
import { MaterialSchema } from "@packages/db/zod/modules/printing";
import { LocationNameSchema } from "@packages/db/zod/modules/training";
import * as z from "zod";
import type { PrinterConfig } from "@/lib/printers/types";
import { threeDP } from "@/orpc";
import { addPrinter, PrinterConflictError } from "@/printing";

const setupConfig = z.object({
  ip: z.string().min(1),
  name: z.string().min(1),
  manufacturer: z.enum(["PRUSA", "BAMBU"]),
  slots: z
    .array(
      z
        .object({
          material: MaterialSchema,
          colour: z.string().min(1),
          nozzle_temp_min: z.int().positive(),
          nozzle_temp_max: z.int().positive(),
          bed_temp: z.int().positive(),
        })
        .refine((slot) => slot.nozzle_temp_max > slot.nozzle_temp_min, {
          message: "nozzle_temp_max must be greater than nozzle_temp_min",
          path: ["nozzle_temp_max"],
        }),
    )
    .min(1),
  hasCamera: z.boolean(),
  keys: z.array(z.string().min(1)).min(2),
});

const Details = z.object({
  model: z.string().min(1),
  location: LocationNameSchema,
});

export const add = threeDP
  .errors({
    PRINTER_ALREADY_EXISTS: {
      status: 409,
      message: "A printer with this name or ip already exists",
      data: z.object({ field: z.enum(["name", "ip"]), value: z.string() }),
    },
  })
  .route({ method: "POST", path: "/add" })
  .input(
    z.object({
      name: z.string().min(1),
      setup: setupConfig,
      detail: Details,
      connect: z.boolean().default(true).optional(),
    }),
  )
  .handler(async ({ input: { name, setup, detail, connect }, errors }) => {
    const slots = setup.slots.map((slot, index) => ({
      slotId: index,
      filamentType: slot.material,
      colour: slot.colour,
      nozzleTempMin: slot.nozzle_temp_min,
      nozzleTempMax: slot.nozzle_temp_max,
      bedTemp: slot.bed_temp,
    }));

    const queue: printing.QueueType = slots.length > 1 ? "MULTI" : slots[0].filamentType;

    const config: PrinterConfig = {
      ip: setup.ip,
      name: name,
      manufacturer: setup.manufacturer,
      slots,
      queue,
      hasCamera: setup.hasCamera,
      ...(setup.manufacturer === "PRUSA"
        ? { username: setup.keys[0], password: setup.keys[1] }
        : { serial: setup.keys[0], password: setup.keys[1] }),
    };

    try {
      await addPrinter(config, detail, connect);
    } catch (error) {
      if (error instanceof PrinterConflictError) {
        throw errors.PRINTER_ALREADY_EXISTS({ data: { field: error.field, value: error.value } });
      }
      throw error;
    }
  });
