import e from "@packages/db/edgeql-js";
import { PrioritySchema } from "@packages/db/zod/modules/printing";
import jwt from "jsonwebtoken";
import * as z from "zod";
import env from "@/lib/env";
import { printFilamentSlotSchema, queueErrors } from "@/lib/printers/utils";
import { printing } from "@/orpc";
import { status } from "./status";
import { send } from "./send";

const fileTypeEnum = z.enum(["gcode", "3mf"]);

export const file = printing
  .errors(queueErrors)
  .route({ method: "GET", path: "/" })
  .input(z.object({ id: z.uuid(), file_type: fileTypeEnum }))
  .output(z.file())
  .handler(async ({ input: { id, file_type }, context: { db }, errors }) => {
    const print = await e.select(e.printing.Print, () => ({ name: true, filter_single: { id: e.uuid(id) } })).run(db);
    if (!print) throw errors.PRINT_JOB_NOT_FOUND({ data: { id } });

    let response: Response;
    try {
      response = await fetch(`${env.cdn.url}/prints/${id}.${file_type}`);
    } catch {
      throw errors.DOWNLOAD_FAILED();
    }
    if (response.status === 404) throw errors.FILE_NOT_FOUND({ data: { id, file_type } });
    if (!response.ok) throw errors.DOWNLOAD_FAILED();

    const blob = await response.blob();
    return new File([blob], `${print.name}.${file_type}`, { type: blob.type || "application/octet-stream" });
  });

const printUpdateSchema = z.object({
  mass: z.float32().optional(),
  duration: z.iso.duration().optional(),
  priority: PrioritySchema.optional(),
  filament: z.array(printFilamentSlotSchema.omit({ slot_id: true })).optional(),
  gcode: z.file().mime(["text/plain", "application/octet-stream"]).optional(),
  threemf: z.file().mime(["model/3mf", "application/octet-stream"]).optional(),
});

export const update = printing
  .errors({ ...queueErrors, UPLOAD_FAILED: { status: 502, message: "Failed to upload print files to the CDN" } })
  .route({ method: "PATCH", path: "/" })
  .input(z.object({ id: z.uuid(), updates: printUpdateSchema }))
  .output(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id, updates }, errors, context: { db, user } }) => {
    const { mass, duration, priority, filament, gcode, threemf } = updates;
    if (Boolean(gcode) !== Boolean(threemf)) throw errors.INPUT_VALIDATION_FAILED();

    const print = await e
      .select(e.printing.Print, (p) => ({
        history_status: e.assert_single(p.history.status.__type__.name),
        filter_single: { id: e.uuid(id) },
      }))
      .run(db);
    if (!print) throw errors.PRINT_JOB_NOT_FOUND({ data: { id } });
    if (print.history_status === "printing::print_status::Printing") throw errors.PRINT_STARTED();

    if (mass !== undefined || duration !== undefined || priority !== undefined || filament !== undefined) {
      await e
        .update(e.printing.Print, () => ({
          filter_single: { id: e.uuid(id) },
          set: {
            ...(mass !== undefined ? { mass } : {}),
            ...(duration !== undefined ? { duration: e.cast(e.duration, e.str(duration)) } : {}),
            ...(priority !== undefined ? { priority } : {}),
            ...(filament !== undefined ? { filament } : {}),
          },
        }))
        .run(db);
    }

    if (gcode && threemf) {
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

      await e
        .update(e.printing.PrintHistory, (p) => ({
          filter: e.op(e.assert_single(p["<history[is printing::Print]"].id), "=", e.uuid(id)),
          set: {
            attempts: 0,
          },
        }))
        .run(db);
    }

    return { id };
  });

export const idRouter = printing.prefix("/{id}").router({
  file,
  status,
  update,
  send,
});
