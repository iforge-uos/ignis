import * as z from "zod";
import { ensurePrinters, threeDP } from "@/orpc";
import { connectPrinter, printers } from "@/printing";
import { PRINTER_CONNECTION_ERRORS } from "@/lib/printers/utils";

export const connect = threeDP
  .errors(PRINTER_CONNECTION_ERRORS)
  .use(ensurePrinters)
  .route({ method: "POST", path: "/connect" })
  .input(z.object({ name: z.string().min(1) }))
  .handler(async ({ input: { name }, errors }) => {
    const printer = printers.get(name);
    let connected: boolean;
    if (!printer) throw errors.PRINTER_NOT_FOUND({ data: { name } });
    try {
      connected = await connectPrinter(printer.id);
    } catch {
      throw errors.CONNECTION_FAILED();
    }
    if (!connected) throw errors.CONNECTION_FAILED();
  });
