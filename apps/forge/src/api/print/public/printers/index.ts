import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { auth, ensurePrinters } from "@/orpc";
import type { PrinterStatus } from "@/lib/printers/types";
import { printerSchema, toFilamentSlots } from "@/lib/printers/utils";
import { printManager } from "@/printing";
import { printer } from "./$name";
import { publicStatusSchema, toPublicStatus } from "@/lib/printers/utils";

export const printers = auth
  .use(ensurePrinters)
  .route({ method: "GET", path: "/" })
  .output(z.array(z.object({ printer: printerSchema, status: publicStatusSchema })))
  .handler(async ({ context: { db } }) => {
    const rows = await e
      .select(e.printing.Printer, (p) => ({
        id: true,
        name: true,
        manufacturer: true,
        model: true,
        has_camera: true,
        filament: true,
        location: p.location.name,
        total_print_mass: true,
        total_print_time: true,
      }))
      .run(db);

    return Promise.all(
      rows.map(async (p) => {
        let status: PrinterStatus = { state: "disconnected" };
        if (printManager.Printers.includes(p.name)) {
          try {
            status = await printManager.getStatus(p.name);
          } catch {
            status = { state: "disconnected" };
          }
        }
        return { printer: { ...p, filament: toFilamentSlots(p.filament) }, status: toPublicStatus(status) };
      }),
    );
  });

export const printersRoute = auth.prefix("/printers").router({
  printers,
  printer,
});
