import { Temporal } from "@js-temporal/polyfill";
import e, { $infer } from "@packages/db/edgeql-js";
import {
  CreateDowntimeSchema,
  CreatePrinterSchema,
  MaterialSchema,
  PrioritySchema,
  QueueTypeSchema,
} from "@packages/db/zod/modules/printing";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import type { Executor } from "gel";
import * as z from "zod";
import { printing } from "@packages/db/interfaces";
import type { Filament, PrinterStatus } from "@/lib/printers/types";

export const QUEUE_RETURN_ITEMS = 20;
export const THREEDP_LAPTOP_ACCOUNT = "uuid-8438";

export const durationOut = z.instanceof(Temporal.Duration);
export const datetimeOut = z.instanceof(Temporal.ZonedDateTime);

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
  start_time: datetimeOut,
  end_time: datetimeOut.nullable(),
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

export const ANY_COLOUR = "ANY";

export const filamentSlotSchema = z.object({
  slot_id: z.number(),
  material: MaterialSchema,
  colour: z.string().length(8),
  nozzle_temp_min: z.int().positive(),
  nozzle_temp_max: z.int().positive(),
  bed_temp: z.int().positive(),
});

export const printFilamentSlotSchema = filamentSlotSchema.extend({
  colour: z.union([z.string().length(8), z.literal(ANY_COLOUR)]),
});

export const printerSchema = CreatePrinterSchema.omit({ ip: true, keys: true, filament: true }).extend({
  id: z.uuid(),
  location: LocationNameSchema,
  total_print_time: durationOut,
  filament: z.array(filamentSlotSchema),
});

export const printerStatusSchema = z.object({
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

export const publicStatusSchema = printerStatusSchema.omit({ errors: true }).extend({
  current_job: printerStatusSchema.shape.current_job.unwrap().omit({ print_job: true, name: true }).optional(),
});

export function toPublicStatus(status: PrinterStatus): z.infer<typeof publicStatusSchema> {
  return {
    state: status.state,
    temperature: status.temperature,
    current_job: status.current_job && {
      progress: status.current_job.progress,
      time_remaining: status.current_job.time_remaining,
    },
  };
}

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
      duration: durationOut,
      priority: PrioritySchema,
      filament: z.array(printFilamentSlotSchema),
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
    has_timelapse: z.boolean(),
  }),
);

export const queueHistoryOutput = z.array(
  historyOutput.element.extend({
    position: z.int().positive(),
    lead_time: durationOut,
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
  }));
}

export async function timelapsesInPeriod(
  db: Executor,
  start: Temporal.ZonedDateTime,
  end?: Temporal.ZonedDateTime,
): Promise<string[]> {
  const start_at = e.cast(e.datetime, start.toInstant().toString());
  const end_at = end ? e.cast(e.datetime, end.toInstant().toString()) : e.datetime_current();
  const histories = await e
    .select(e.printing.PrintHistory, (h) => ({
      id: true,
      filter: e.op(
        h.has_timelapse,
        "and",
        e.op(e.op(h.created_at, ">=", start_at), "and", e.op(h.created_at, "<=", end_at)),
      ),
      order_by: { expression: h.created_at, direction: e.DESC },
    }))
    .run(db);
  return histories.map((h) => h.id);
}

export function printsAhead(queue: any, created_at: any, priority: any, status: any, printer: any, pinned?: boolean) {
  return e.select(e.printing.PrintHistory, (q) => {
    const print = e.assert_exists(e.assert_single(q["<on[is printing::Print]"]));
    const sameMaterial = e.op(q.queue, "=", queue);
    const assignedLane = e.op(
      e.op(q.printer.id, "?=", printer.id),
      "or",
      e.op(e.op("not", e.op("exists", q.printer)), "and", sameMaterial),
    );
    const lane = e.op(assignedLane, "if", e.op("exists", printer), "else", sameMaterial);
    const aheadOf = e.op(
      e.op(print.priority, ">", priority),
      "or",
      e.op(e.op(print.priority, "=", priority), "and", e.op(q.created_at, "<", created_at)),
    );
    let filter = e.op(e.op("exists", q.status.is(status)), "and", e.op(lane, "and", aheadOf));
    if (pinned === true) filter = e.op(filter, "and", e.op("exists", q.printer));
    if (pinned === false) filter = e.op(filter, "and", e.op("not", e.op("exists", q.printer)));
    return { filter };
  });
}

export const LEAD_TIME_BUFFER = 1.5;

export function queueHostCount(queue: any) {
  return e.op(
    e.int64(1),
    "if",
    e.op(queue, "=", e.cast(e.printing.QueueType, "MULTI")),
    "else",
    e.count(e.select(e.printing.Printer, (pr) => ({ filter: e.op(pr.queue, "=", queue) }))),
  );
}

export function leadTimeFields(
  aheadPinned: ReturnType<typeof printsAhead>,
  aheadShared: ReturnType<typeof printsAhead>,
  queue: any,
) {
  return {
    lead_pinned: e.sum(aheadPinned["<on[is printing::Print]"].duration),
    lead_shared: e.sum(aheadShared["<on[is printing::Print]"].duration),
    hosts: queueHostCount(queue),
  };
}

export function adjustLeadTime(
  pinned: Temporal.Duration,
  shared: Temporal.Duration,
  hosts: number | bigint,
  own: Temporal.Duration,
): Temporal.Duration {
  const seconds =
    (pinned.total({ unit: "seconds" }) + shared.total({ unit: "seconds" }) / Math.max(Number(hosts), 1)) *
    LEAD_TIME_BUFFER;
  return Temporal.Duration.from({ seconds: Math.round(seconds + own.total({ unit: "seconds" })) });
}

export function filamentMatches(
  print: { colour: string; material: string }[],
  slots: { colour: string; material: string }[],
) {
  return print.every((f) =>
    slots.some((s) => s.material === f.material && (f.colour === ANY_COLOUR || s.colour === f.colour)),
  );
}

export const queueErrors = {
  FILE_NOT_FOUND: {
    status: 404,
    message: "Print file not found",
    data: z.object({ id: z.uuid(), file_type: z.string() }),
  },
  PRINTER_FILAMENT_MISMATCH: {
    status: 422,
    message: "Selected printer's filament does not match the print",
    data: z.object({ name: z.string() }),
  },
  DOWNLOAD_FAILED: {
    status: 502,
    message: "Failed to fetch print file from the CDN",
  },
  PRINT_STARTED: {
    status: 409,
    message: "Print started, cancel/finish print to change print status",
  },
  PRINT_UNDER_REVIEW: {
    status: 409,
    message: "Print under review, unable to send print",
  },
  PRINT_CANCELLED_OR_FAILED: {
    status: 409,
    message: "Print failed or has been cancelled, unable to send print",
  },
} as const;
