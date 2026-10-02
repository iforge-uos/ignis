import e from "@packages/db/edgeql-js";
import { DriversSchema } from "@packages/db/zod/modules/printing";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { DRIVER_KEY_COUNT, PRINTER_CONNECTION_ERRORS } from "@/lib/printers/utils";
import { ensurePrinters, threeDP } from "@/orpc";
import { PrinterConflictError, PrinterNotFoundError, printers, printManager, updatePrinter } from "@/printing";

const printerUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  ip: z.string().min(1).optional(),
  keys: z.array(z.string().min(1)).min(1).max(2).optional(),
  driver: DriversSchema.optional(),
  has_camera: z.boolean().optional(),
  model: z.string().min(1).optional(),
  location: LocationNameSchema.optional(),
});

export const update = threeDP
  .errors({
    ...PRINTER_CONNECTION_ERRORS,
    PRINTER_ALREADY_EXISTS: {
      status: 409,
      message: "A printer with this name or ip already exists",
      data: z.object({ field: z.enum(["name", "ip"]), value: z.string() }),
    },
    PRINTER_BUSY: {
      status: 409,
      message: "The printer is mid-print, so its connection settings cannot be changed",
      data: z.object({ name: z.string() }),
    },
    WRONG_KEY_COUNT: {
      status: 422,
      message: "Wrong number of keys for this driver",
      data: z.object({ driver: DriversSchema, expected: z.int() }),
    },
  })
  .use(ensurePrinters)
  .route({ method: "PATCH", path: "/" })
  .input(z.object({ name: z.string().min(1), updates: printerUpdateSchema }))
  .output(z.object({ connected: z.boolean() }))
  .handler(async ({ input: { name, updates }, errors, context: { db } }) => {
    const record = printers.get(name);
    if (!record) throw errors.PRINTER_NOT_FOUND({ data: { name } });

    if (updates.keys || updates.driver) {
      const current = await e
        .select(e.printing.Printer, () => ({ driver: true, filter_single: { id: record.id } }))
        .run(db);
      if (!current) throw errors.PRINTER_NOT_FOUND({ data: { name } });
      const driver = updates.driver ?? current.driver;
      const expected = DRIVER_KEY_COUNT[driver];
      const driver_changed = updates.driver !== undefined && updates.driver !== current.driver;
      if (driver_changed && !updates.keys) throw errors.WRONG_KEY_COUNT({ data: { driver, expected } });
      if (updates.keys && updates.keys.length !== expected) throw errors.WRONG_KEY_COUNT({ data: { driver, expected } });
    }

    const reconnects =
      updates.name !== undefined ||
      updates.ip !== undefined ||
      updates.keys !== undefined ||
      updates.driver !== undefined ||
      updates.has_camera !== undefined;

    if (reconnects && printManager.isConnected(name)) {
      const status = await printManager.getStatus(name);
      if (status.state === "printing" || status.state === "paused") {
        throw errors.PRINTER_BUSY({ data: { name } });
      }
    }

    try {
      return { connected: await updatePrinter(name, updates) };
    } catch (error) {
      if (error instanceof PrinterNotFoundError) {
        throw errors.PRINTER_NOT_FOUND({ data: { name } });
      }
      if (error instanceof PrinterConflictError) {
        throw errors.PRINTER_ALREADY_EXISTS({ data: { field: error.field, value: error.value } });
      }
      throw error;
    }
  });
