import * as z from "zod";
import { threeDP } from "@/orpc";
import { PrinterNotFoundError, retirePrinter } from "@/printing";
import { PRINTER_CONNECTION_ERRORS } from "@/lib/printers/utils";

export const remove = threeDP
  .errors(PRINTER_CONNECTION_ERRORS)
  .route({ method: "DELETE", path: "/remove" })
  .input(z.object({ name: z.string().min(1) }))
  .handler(async ({ input: { name }, errors }) => {
    try {
      await retirePrinter(name);
    } catch (error) {
      if (error instanceof PrinterNotFoundError) {
        throw errors.PRINTER_NOT_FOUND({ data: { name } });
      }
      throw error;
    }
  });
