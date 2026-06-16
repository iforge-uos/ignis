import * as z from "zod";
import { threeDP } from "@/orpc";
import { printers, printManager } from "@/printing";
import { PRINTER_CONNECTION_ERRORS } from ".";

export const disconnect = threeDP
  .errors(PRINTER_CONNECTION_ERRORS)
  .route({ method: "DELETE", path: "/disconnect" })
  .input(z.object({ name: z.string().min(1) }))
  .handler(async ({ input: { name }, errors }) => {
    const printer = printers.get(name);
    if (!printer) throw errors.PRINTER_NOT_FOUND({ data: { name } });
    try {
      await printManager.removePrinter(name);
      printers.set(name, { id: printer.id, connected: false });
    } catch {
      throw errors.DISCONNECT_FAILURE();
    }
  });
