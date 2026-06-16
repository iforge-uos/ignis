import e from "@packages/db/edgeql-js";
import {
  CreateDowntimeSchema,
  MaterialSchema,
  PrioritySchema,
  QueueTypeSchema,
} from "@packages/db/zod/modules/printing";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { durationSchema } from "@packages/db/zod/modules/std";
import * as z from "zod";

export const downtimeError = {
  DOWNTIME_NOT_FOUND: {
    status: 404,
    message: "Downtime not found",
    data: z.object({ msg: z.string() }),
  },
} as const;

export const downtimeSchema = z.object({
  id: z.uuid(),
  start_time: CreateDowntimeSchema.shape.start_time,
  end_time: CreateDowntimeSchema.shape.end_time,
  has_started: z.boolean(),
  has_finished: z.boolean(),
  reason: z.string().nullable(),
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

export const filamentSlotSchema = z.object({
  slotId: z.number(),
  filamentType: MaterialSchema,
  colour: z.string(),
  nozzleTempMin: z.number(),
  nozzleTempMax: z.number(),
  bedTemp: z.number(),
});

export const printerSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  manufacturer: z.string(),
  model: z.string(),
  has_camera: z.boolean(),
  filament_slots: z.array(filamentSlotSchema),
  location: LocationNameSchema,
  total_print_mass: z.number(),
  total_print_time: durationSchema,
});

// for db -> standard
export const toFilamentSlots = (
  slots: { material: string; colour: string; nozzle_temp_min: number; nozzle_temp_max: number; bed_temp: number }[],
): z.infer<typeof filamentSlotSchema>[] =>
  slots.map((s, i) => ({
    slotId: i,
    filamentType: s.material as z.infer<typeof MaterialSchema>,
    colour: s.colour,
    nozzleTempMin: s.nozzle_temp_min,
    nozzleTempMax: s.nozzle_temp_max,
    bedTemp: s.bed_temp,
  }));

export const historyErrors = {
  HISTORY_NOT_FOUND: {
    status: 404,
    message: "History not found",
    data: z.object({ msg: z.string() }),
  },
};

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
