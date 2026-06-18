import e from "@packages/db/edgeql-js";
import { CreatePrintSchema, QueueTypeSchema } from "@packages/db/zod/modules/printing";
import { durationSchema } from "@packages/db/zod/modules/std";
import jwt from "jsonwebtoken";
import * as z from "zod";
import env from "@/lib/env";
import {
  filamentSlotSchema,
  printHistoryShape,
  printsAhead,
  queueHistoryOutput,
  toHistoryOutput,
} from "@/lib/printers/utils";
import { ableToQueuePrint, auth, printing, transaction } from "@/orpc";
import { printers } from "@/printing.ts";
import { idRouter } from "./$id.ts";
import { THREEDP_LAPTOP_ACCOUNT } from "@/lib/printers/utils";

const uploadErrors = {
  UPLOAD_FAILED: {
    status: 502,
    message: "Failed to upload print files to the CDN",
  },
  INCORRECT_PASSWORD: {
    status: 403,
    message: "Incorrect upload password",
  },
} as const;

const uploadSchema = CreatePrintSchema.extend({
  filament: z.array(filamentSlotSchema.omit({ slot_id: true })),
  author: z.uuid(),
  approved_by: z.uuid(),
  gcode: z.file().mime(["text/plain", "application/octet-stream"]),
  threemf: z.file().mime(["model/3mf", "application/octet-stream"]),
  timelapse: z.boolean().default(false),
});

export const add = ableToQueuePrint
  .errors(uploadErrors)
  .route({ method: "POST", path: "/" })
  .input(
    z.object({
      print: uploadSchema,
      password: z.string().min(1),
    }),
  )
  .output(
    z.object({
      id: z.uuid(),
      reset_priority: z.boolean(),
      position: z.int().positive(),
      lead_time: durationSchema,
      msg: z.string().optional(),
    }),
  )
  .use(transaction)
  .handler(async ({ input: { print, password }, context: { tx, user }, errors }) => {
    if (password !== env.printing.threeDpSubmitPassword) throw errors.INCORRECT_PASSWORD();
    let { name, duration, mass, priority, reason, filament, author, approved_by, gcode, threemf, timelapse } = print;
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
        on: e.insert(e.printing.PrintHistory, {
          status: e.insert(e.printing.print_status.Queued, {}),
          has_timelapse: timelapse,
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

    const stats = await e
      .assert_exists(
        e.select(e.printing.Print, (pr) => {
          const h = e.assert_exists(e.assert_single(pr.on));
          const ahead = printsAhead(h.queue, h.created_at, pr.priority, e.printing.print_status.Queued);
          return {
            position: e.op(e.count(ahead), "+", e.int64(1)),
            lead_time: e.sum(ahead["<on[is printing::Print]"].duration),
            filter_single: { id: e.uuid(id) },
          };
        }),
      )
      .run(tx);

    if (priority_decrease)
      return {
        id,
        reset_priority: priority_decrease,
        position: stats.position,
        lead_time: stats.lead_time,
        msg: "Priority reset to LOW as admin or 3DP permission required, and not on 3DP laptop account",
      };
    return { id, reset_priority: priority_decrease, position: stats.position, lead_time: stats.lead_time };
  });

const QUEUE_RETURN_ITEMS = 20;

export const get = printing
  .route({ method: "GET", path: "/" })
  .input(
    z.object({
      printer_name: z.string().min(1).optional(),
      queue: QueueTypeSchema.optional(),
      review: z.boolean().default(false),
      user: z.uuid().optional(),
      offset: z.int().nonnegative().default(0),
    }),
  )
  .output(queueHistoryOutput)
  .handler(async ({ input: { printer_name, queue, review, user, offset }, errors, context: { db } }) => {
    let printer_id: string | undefined;
    if (printer_name) {
      printer_id = printers.get(printer_name)?.id;
      if (!printer_id) throw errors.PRINTER_NOT_FOUND({ data: { name: printer_name } });
    }

    const status = review ? e.printing.print_status.UnderReview : e.printing.print_status.Queued;

    const history = await e
      .select(e.printing.PrintHistory, (p) => {
        const conditions = [
          e.op("exists", p.status.is(status)),
          ...(printer_id ? [e.op(p.printer.id, "=", e.uuid(printer_id))] : []),
          ...(queue ? [e.op(p.queue, "=", e.cast(e.printing.QueueType, queue))] : []),
          ...(user ? [e.op(p["<on[is printing::Print]"].author.id, "=", e.uuid(user))] : []),
        ];

        const print = e.assert_exists(e.assert_single(p["<on[is printing::Print]"]));
        const ahead = printsAhead(p.queue, p.created_at, print.priority, status);

        return {
          ...printHistoryShape(p),
          position: e.op(e.count(ahead), "+", e.int64(1)),
          lead_time: e.sum(ahead["<on[is printing::Print]"].duration),
          filter: e.all(e.set(...conditions)),
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
      lead_time: history[i]!.lead_time,
    }));
  });

export const queueRouter = auth.prefix("/queue").router({
  ...idRouter,
  add,
  get,
});
