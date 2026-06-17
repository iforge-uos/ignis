import e, { $infer } from "@packages/db/edgeql-js";
import {
  CreateDowntimeSchema,
  CreatePrinterSchema,
  MaterialSchema,
  PrioritySchema,
  QueueTypeSchema,
} from "@packages/db/zod/modules/printing";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { durationSchema } from "@packages/db/zod/modules/std";
import * as z from "zod";
import { printing } from "@packages/db/interfaces";
import type { Filament } from "@/lib/printers/types";

export const THREEDP_LAPTOP_ACCOUNT = "uuid-8438";

export const PRINTER_CONNECTION_ERRORS = {
  PRINTER_NOT_FOUND: {
    status: 404,
    message: "Printer not found",
    data: z.object({ name: z.string() }),
  },
  DISCONNECT_FAILURE: {
    status: 502,
    message: "Failed to disconnect",
  },
  CONNECTION_FAILED: {
    status: 502,
    message: "Failed to connect to printer",
  },
} as const;

export const downtimeError = {
  DOWNTIME_NOT_FOUND: {
    status: 404,
    message: "Downtime not found",
    data: z.object({ msg: z.string() }),
  },
} as const;

export const downtimeSchema = CreateDowntimeSchema.omit({ created_at: true }).extend({
  id: z.uuid(),
  printer: z.object({ id: z.uuid(), name: z.string() }),
});

export const downtimeShape = e.shape(e.printing.Downtime, () => ({
  id: true,
  start_time: true,
  end_time: true,
  has_started: true,
  has_finished: true,
  reason: true,
  printer: { id: true, name: true },
}));

type filamentDB = printing.Printer["filament"][number];

export function toFilamentSlots(filament: filamentDB[]): Filament[] {
  return filament.map((slot, i) => ({ ...slot, slot_id: i }));
}

export const filamentSlotSchema = z.object({
  slot_id: z.number(),
  material: MaterialSchema,
  colour: z.string().length(8),
  nozzle_temp_min: z.int().positive(),
  nozzle_temp_max: z.int().positive(),
  bed_temp: z.int().positive(),
});

export const printerSchema = CreatePrinterSchema.omit({ ip: true, keys: true, filament: true }).extend({
  id: z.uuid(),
  location: LocationNameSchema,
  filament: z.array(filamentSlotSchema),
});

export const historyErrors = {
  HISTORY_NOT_FOUND: {
    status: 404,
    message: "History not found",
    data: z.object({ msg: z.string() }),
  },
} as const;

export const historyOutput = z.array(
  z.object({
    id: z.uuid(),
    queue: QueueTypeSchema,
    print: z.object({
      id: z.uuid(),
      name: z.string(),
      mass: z.number(),
      duration: durationSchema,
      priority: PrioritySchema,
      filament: z.array(filamentSlotSchema),
      author: z.object({ id: z.uuid(), display_name: z.string() }),
      approved_by: z.object({ id: z.uuid(), display_name: z.string() }),
    }),
    printer: z
      .object({
        id: z.uuid(),
        name: z.string(),
      })
      .optional(),
    attempts: z.int().nonnegative(),
    timelapse: z.boolean(),
  }),
);

export const printHistoryShape = e.shape(e.printing.PrintHistory, (h) => ({
  id: true,
  queue: true,
  attempts: true,
  has_timelapse: true,
  printer: { id: true, name: true },
  print: e.assert_exists(
    e.assert_single(
      e.select(h["<on[is printing::Print]"], () => ({
        id: true,
        name: true,
        mass: true,
        duration: true,
        priority: true,
        filament: true,
        author: { id: true, display_name: true },
        approved_by: { id: true, display_name: true },
      })),
    ),
  ),
}));

type printHistoryRow = $infer<typeof printHistoryShape>[number];

export function toHistoryOutput(history: printHistoryRow[]) {
  return history.map((h) => ({
    ...h,
    print: { ...h.print, filament: toFilamentSlots(h.print.filament) },
    printer: h.printer ?? undefined,
    timelapse: h.has_timelapse,
  }));
}

export const queueErrors = {
  FILE_NOT_FOUND: {
    status: 404,
    message: "Print file not found",
    data: z.object({ id: z.uuid(), file_type: z.string() }),
  },
  DOWNLOAD_FAILED: {
    status: 502,
    message: "Failed to fetch print file from the CDN",
  },
  PRINT_STARTED: {
    status: 409,
    message: "Print started, cancel/finish print to change print status",
  },
} as const;
