import * as z from "zod";
import { ensurePrinters, threeDP } from "@/orpc";
import { printers, printManager } from "@/printing";
import { PRINTER_CONNECTION_ERRORS } from "@/lib/printers/utils";

export const disconnect = threeDP
  .errors(PRINTER_CONNECTION_ERRORS)
  .use(ensurePrinters)
  .route({ method: "DELETE", path: "/disconnect" })
  .input(z.object({ name: z.string().min(1) }))
  .handler(async ({ input: { name }, errors }) => {
    const printer = printers.get(name);
    if (!printer) throw errors.PRINTER_NOT_FOUND({ data: { name } });
    try {
      await printManager.removePrinter(name);
      printers.set(name, { id: printer.id, connected: false, queue: printer.queue });
    } catch {
      throw errors.DISCONNECT_FAILURE();
    }
  });
