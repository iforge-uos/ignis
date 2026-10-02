import type { printing } from "@packages/db/interfaces";
import { DriversSchema } from "@packages/db/zod/modules/printing";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import type { PrinterConfig } from "@/lib/printers/types";
import { DRIVER_KEY_COUNT, filamentSlotSchema } from "@/lib/printers/utils";
import { threeDP } from "@/orpc";
import { addPrinter, PrinterConflictError } from "@/printing";

const setupConfig = z
  .object({
    ip: z.string().min(1),
    name: z.string().min(1),
    manufacturer: z.enum(["PRUSA", "BAMBU"]),
    driver: DriversSchema,
    slots: z
      .array(
        filamentSlotSchema.omit({ slot_id: true }).refine((slot) => slot.nozzle_temp_max > slot.nozzle_temp_min, {
          message: "nozzle_temp_max must be greater than nozzle_temp_min",
          path: ["nozzle_temp_max"],
        }),
      )
      .min(1),
    has_camera: z.boolean(),
    keys: z.array(z.string().min(1)).min(1),
  })
  .refine((setup) => setup.keys.length === DRIVER_KEY_COUNT[setup.driver], {
    message: "Wrong number of keys for this driver",
    path: ["keys"],
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
    const filament = setup.slots.map((slot, index) => ({ slot_id: index, ...slot }));

    const queue: printing.QueueType = filament.length > 1 ? "MULTI" : filament[0].material;

    let credentials: Record<string, string>;
    switch (setup.driver) {
      case "OCTOPRINT":
        credentials = { api_key: setup.keys[0] };
        break;
      case "PRUSALINK":
        credentials = { username: setup.keys[0], password: setup.keys[1] };
        break;
      case "BAMBU":
        credentials = { serial: setup.keys[0], password: setup.keys[1] };
        break;
      default:
        throw new Error(`Unknown driver "${setup.driver}"`);
    }

    const config: PrinterConfig = {
      ip: setup.ip,
      name,
      manufacturer: setup.manufacturer,
      driver: setup.driver,
      filament,
      queue,
      has_camera: setup.has_camera,
      ...credentials,
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
