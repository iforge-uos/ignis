import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { printerSchema, toFilamentSlots } from "@/lib/printers/utils";
import { printing, threeDP } from "@/orpc";
import { printers } from "@/printing";
import { add } from "./add";
import { connect } from "./connect";
import { disconnect } from "./disconnect";
import { reconnect } from "./reconnect";
import { remove } from "./remove";

export const get = printing
  .route({ method: "GET", path: "/" })
  .input(z.object({ name: z.string().min(1) }))
  .output(printerSchema.nullable())
  .handler(async ({ input: { name }, errors, context: { db } }) => {
    const uuid = printers.get(name)?.id;
    if (!uuid) throw errors.PRINTER_NOT_FOUND({ data: { name } });
    const printer = await e
      .select(e.printing.Printer, () => ({
        id: true,
        name: true,
        manufacturer: true,
        model: true,
        has_camera: true,
        filament: true,
        location: { name: true },
        total_print_mass: true,
        total_print_time: true,
        filter_single: { id: uuid },
      }))
      .run(db);
    if (!printer) return null;
    return { ...printer, location: printer.location.name, filament: toFilamentSlots(printer.filament) };
  });

export const nameRoutes = threeDP.prefix("/{name}").router({
  get,
  add,
  remove,
  connect,
  disconnect,
  reconnect,
});
