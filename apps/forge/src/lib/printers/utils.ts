import e from "@packages/db/edgeql-js";
import {
  CreateDowntimeSchema,
  CreatePrinterSchema,
  CreatePrintSchema,
  MaterialSchema,
  PrioritySchema,
  QueueTypeSchema,
} from "@packages/db/zod/modules/printing";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { durationSchema } from "@packages/db/zod/modules/std";
import * as z from "zod";
import { printer } from "/src/api/print/history/$name";

export const downtimeError = {
  DOWNTIME_NOT_FOUND: {
    status: 404,
    message: "Downtime not found",
    data: z.object({ msg: z.string() }),
  },
} as const;

export const downtimeSchema = CreateDowntimeSchema.omit({ created_at: true }).extend({
  id: z.uuid,
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

export const filamentSchema = CreatePrintSchema.shape.filament;

export const printerSchema = CreatePrinterSchema.omit({ ip: true, keys: true });

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
      filament: z.array(filamentSchema),
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
