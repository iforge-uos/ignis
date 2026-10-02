import * as z from "zod";
import { PRINTER_CONNECTION_ERRORS } from "@/lib/printers/utils";
import { threeDP } from "@/orpc";
import { PrinterNotFoundError, restorePrinter } from "@/printing";

export const restore = threeDP
  .errors(PRINTER_CONNECTION_ERRORS)
  .route({ method: "POST", path: "/restore" })
  .input(z.object({ name: z.string().min(1) }))
  .output(z.object({ connected: z.boolean() }))
  .handler(async ({ input: { name }, errors }) => {
    try {
      return { connected: await restorePrinter(name) };
    } catch (error) {
      if (error instanceof PrinterNotFoundError) {
        throw errors.PRINTER_NOT_FOUND({ data: { name } });
      }
      throw error;
    }
  });
