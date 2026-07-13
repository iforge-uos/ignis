import e from "@packages/db/edgeql-js";
import { CreatePrintSchema, QueueTypeSchema } from "@packages/db/zod/modules/printing";
import jwt from "jsonwebtoken";
import * as z from "zod";
import env from "@/lib/env";
import {
  adjustLeadTime,
  ANY_COLOUR,
  durationOut,
  filamentMatches,
  leadTimeFields,
  printFilamentSlotSchema,
  printHistoryShape,
  printsAhead,
  queueHistoryOutput,
  THREEDP_LAPTOP_ACCOUNT,
  toHistoryOutput,
  QUEUE_RETURN_ITEMS,
} from "@/lib/printers/utils";
import { ableToQueuePrint, auth, printing, transaction } from "@/orpc";
import { printers } from "@/printing.ts";
import { idRouter } from "./$id.ts";
import { length } from "./length.ts";
import email from "@/email";
import { PartialUserShape } from "@/lib/utils/queries";

const uploadErrors = {
  UPLOAD_FAILED: {
    status: 502,
    message: "Failed to upload print files to the CDN",
  },
  INCORRECT_PASSWORD: {
    status: 403,
    message: "Incorrect upload password",
  },
  PRINTER_NOT_FOUND: {
    status: 404,
    message: "Printer not found",
    data: z.object({ name: z.string() }),
  },
  PRINTER_FILAMENT_MISMATCH: {
    status: 422,
    message: "Selected printer's filament does not match the print",
    data: z.object({ name: z.string() }),
  },
  PRINTER_REQUIRED_FOR_MULTI: {
    status: 409,
    message: "Printer selection required for a multi filament print",
  },
  NO_MATCHING_PRINTER: {
    status: 502,
    message: "No matching printer for print filament",
  },
} as const;

const uploadSchema = CreatePrintSchema.extend({
  filament: z.array(printFilamentSlotSchema.omit({ slot_id: true })),
  author: z.uuid(),
  approved_by: z.uuid(),
  gcode: z.file().refine((f) => f.name.toLowerCase().endsWith(".gcode"), {
    message: "File must be a .gcode file",
  }),
  threemf: z.file().mime(["model/3mf", "application/octet-stream"]),
  timelapse: z.boolean().default(false),
});

export const add = ableToQueuePrint
  .errors(uploadErrors)
  .route({ method: "POST", path: "/" })
  .input(
    z.object({
      print: uploadSchema,
      printer: z.string().optional(),
      password: z.string().min(1),
      review: z.boolean().default(false),
    }),
  )
  .output(
    z.object({
      id: z.uuid(),
      reset_priority: z.boolean(),
      position: z.int().positive(),
      lead_time: durationOut,
      msg: z.string().optional(),
    }),
  )
  .use(transaction)
  .handler(async ({ input: { print, printer, password, review }, context: { db, tx, user }, errors }) => {
    if (password !== env.printing.threeDpSubmitPassword) throw errors.INCORRECT_PASSWORD();

    const is_multi = print.filament.length > 1;
    if (is_multi && !printer) throw errors.PRINTER_REQUIRED_FOR_MULTI();

    const any_colour = !is_multi && print.filament[0].colour === ANY_COLOUR;

    let required_printer_id: string | undefined;
    if (printer) {
      const record = printers.get(printer);
      if (!record) throw errors.PRINTER_NOT_FOUND({ data: { name: printer } });
      if (!is_multi) {
        const target = await e
          .select(e.printing.Printer, () => ({ filament: true, filter_single: { id: record.id } }))
          .run(db);
        const matches = !!target && filamentMatches(print.filament, target.filament);
        if (!matches) throw errors.PRINTER_FILAMENT_MISMATCH({ data: { name: printer } });
      }
      required_printer_id = record.id;
    } else if (!any_colour) {
      const candidates = await e
        .select(e.printing.Printer, (p) => ({ id: true, filament: true, filter: e.op("not", p.old) }))
        .run(db);
      const match = candidates.find((c) => filamentMatches(print.filament, c.filament));
      if (!match) throw errors.NO_MATCHING_PRINTER();
      required_printer_id = match.id;
    }

    let { name, duration, mass, priority, reason, filament, author, approved_by, gcode, threemf, timelapse } = print;
    name = name
      .trim()
      .replace(/[^A-Za-z0-9\-_.()[\] ]/g, "")
      .replace(/\s+/g, "_");
    let priority_decrease = false;
    // This is if 3dp laptop has specific account
    if (user.id === THREEDP_LAPTOP_ACCOUNT && priority !== "LOW") {
      priority = "LOW";
      priority_decrease = true;
    }

    /* Fallback to this if using a different account on iforge 3dp laptop
    const approver = await e
      .select(e.users.Rep, () => ({
        roles: { name: true },
        teams: { name: true },
        filter_single: { id: approved_by },
      }))
      .run(tx);
    const can_prioritise =
      !!approver && (approver.roles.some((r) => r.name === "Admin") || approver.teams.some((t) => t.name === "3DP"));
    if (priority !== "LOW" && !can_prioritise) {
      priority = "LOW";
      priority_decrease = true;
    }
    */

    const { id } = await e
      .insert(e.printing.Print, {
        name,
        duration: e.cast(e.duration, e.str(duration.toString())),
        mass,
        priority,
        reason,
        filament,
        author: e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id: author } }))),
        approved_by: e.assert_exists(e.select(e.users.Rep, () => ({ filter_single: { id: approved_by } }))),
        history: e.insert(e.printing.PrintHistory, {
          status: e.insert(review ? e.printing.print_status.UnderReview : e.printing.print_status.Queued, {}),
          has_timelapse: timelapse,
          ...(required_printer_id
            ? {
                printer: e.assert_exists(
                  e.select(e.printing.Printer, () => ({ filter_single: { id: required_printer_id! } })),
                ),
              }
            : {}),
        }),
      })
      .run(tx);

    const access_token = jwt.sign({ sub: user.id, roles: user.roles.map((r) => r.id) }, env.auth.jwtSecret!, {
      expiresIn: "5m",
    });

    const form = new FormData();
    form.append("gcode", gcode, `${id}.gcode`);
    form.append("threemf", threemf, `${id}.3mf`);
    form.append("access_token", access_token);

    let response: Response;
    try {
      response = await fetch(`${env.cdn.url}/upload/print/${id}`, { method: "POST", body: form });
    } catch {
      throw errors.UPLOAD_FAILED();
    }
    if (!response.ok) throw errors.UPLOAD_FAILED();

    const [stats] = await e
      .select(e.printing.PrintHistory, (p) => {
        const status = e.printing.print_status.Queued;
        const print = e.assert_exists(e.assert_single(p["<history[is printing::Print]"]));
        const ahead = printsAhead(p.queue, p.created_at, print.priority, status, p.printer);
        const aheadPinned = printsAhead(p.queue, p.created_at, print.priority, status, p.printer, true);
        const aheadShared = printsAhead(p.queue, p.created_at, print.priority, status, p.printer, false);
        return {
          position: e.op(e.count(ahead), "+", e.int64(1)),
          duration: print.duration,
          ...leadTimeFields(aheadPinned, aheadShared, p.queue),
          filter: e.op(e.assert_single(p["<history[is printing::Print]"].id), "=", e.uuid(id)),
        };
      })
      .run(tx);
    if (!stats) throw errors.UPLOAD_FAILED({ message: "print history not found after insert" });

    const lead_time = adjustLeadTime(stats.lead_pinned, stats.lead_shared, stats.hosts, stats.duration);

    const recipient = await e
      .assert_exists(
        e.select(e.users.User, (u) => ({
          filter_single: { id: e.uuid(author) },
          ...PartialUserShape(u),
        })),
      )
      .run(tx);

    await email
      .sendPrintUploadEmail(recipient, {
        created_at: new Date(),
        print_name: name,
        review,
        position: stats.position,
        lead_time,
      })
      .catch(() => {});

    if (priority_decrease)
      return {
        id,
        reset_priority: priority_decrease,
        position: stats.position,
        lead_time,
        msg: "Priority reset to LOW as admin or 3DP permission required, and not on 3DP laptop account",
      };
    return { id, reset_priority: priority_decrease, position: stats.position, lead_time };
  });

const queueFilterBase = z.object({ offset: z.int().nonnegative().default(0) });

export const get = printing
  .route({ method: "GET", path: "/" })
  .input(
    z.discriminatedUnion("by", [
      queueFilterBase.extend({ by: z.literal("all") }),
      queueFilterBase.extend({ by: z.literal("review") }),
      queueFilterBase.extend({ by: z.literal("printer"), value: z.string().min(1) }),
      queueFilterBase.extend({ by: z.literal("queue"), value: QueueTypeSchema }),
      queueFilterBase.extend({ by: z.literal("user"), value: z.uuid() }),
    ]),
  )
  .output(queueHistoryOutput)
  .handler(async ({ input, errors, context: { db } }) => {
    const offset = input.offset;
    let printer_id: string | undefined;
    let printer_queue: string | undefined;
    let queue: string | undefined;
    let user: string | undefined;
    if (input.by === "printer") {
      const record = printers.get(input.value);
      if (!record) throw errors.PRINTER_NOT_FOUND({ data: { name: input.value } });
      printer_id = record.id;
      printer_queue = record.queue;
    } else if (input.by === "queue") {
      queue = input.value;
    } else if (input.by === "user") {
      user = input.value;
    }

    const status = input.by === "review" ? e.printing.print_status.UnderReview : e.printing.print_status.Queued;

    const history = await e
      .select(e.printing.PrintHistory, (p) => {
        const queued = e.op("exists", p.status.is(status));

        const printerScope =
          printer_id && printer_queue
            ? e.op(
                e.op(p.printer.id, "=", e.uuid(printer_id)),
                "or",
                e.op(
                  e.op("not", e.op("exists", p.printer)),
                  "and",
                  e.op(p.queue, "=", e.cast(e.printing.QueueType, printer_queue)),
                ),
              )
            : undefined;

        const scope = printerScope
          ? e.op(queued, "and", printerScope)
          : queue
            ? e.op(queued, "and", e.op(p.queue, "=", e.cast(e.printing.QueueType, queue)))
            : user
              ? e.op(
                  queued,
                  "and",
                  e.op(e.assert_single(p["<history[is printing::Print]"].author.id), "=", e.uuid(user)),
                )
              : queued;

        const print = e.assert_exists(e.assert_single(p["<history[is printing::Print]"]));
        const ahead = printsAhead(p.queue, p.created_at, print.priority, status, p.printer);
        const aheadPinned = printsAhead(p.queue, p.created_at, print.priority, status, p.printer, true);
        const aheadShared = printsAhead(p.queue, p.created_at, print.priority, status, p.printer, false);

        return {
          ...printHistoryShape(p),
          position: e.op(e.count(ahead), "+", e.int64(1)),
          ...leadTimeFields(aheadPinned, aheadShared, p.queue),
          filter: scope,
          order_by: [
            { expression: e.assert_single(print.priority), direction: e.DESC },
            { expression: p.created_at, direction: e.ASC },
          ],
          limit: QUEUE_RETURN_ITEMS,
          offset,
        };
      })
      .run(db);

    return toHistoryOutput(history).map((row, i) => ({
      ...row,
      position: history[i]!.position,
      lead_time: adjustLeadTime(
        history[i]!.lead_pinned,
        history[i]!.lead_shared,
        history[i]!.hosts,
        history[i]!.print.duration,
      ),
    }));
  });

export const queueRouter = auth.prefix("/queue").router({
  ...idRouter,
  add,
  get,
  length,
});
