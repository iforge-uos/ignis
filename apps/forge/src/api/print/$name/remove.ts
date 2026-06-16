import * as z from "zod";
import { threeDP } from "@/orpc";
import { PrinterNotFoundError, removePrinter } from "@/printing";
import { PRINTER_CONNECTION_ERRORS } from ".";

export const remove = threeDP
  .errors(PRINTER_CONNECTION_ERRORS)
  .route({ method: "DELETE", path: "/remove" })
  .input(z.object({ name: z.string().min(1) }))
  .handler(async ({ input: { name }, errors }) => {
    try {
      await removePrinter(name);
    } catch (error) {
      if (error instanceof PrinterNotFoundError) {
        throw errors.PRINTER_NOT_FOUND({ data: { name } });
      }
      throw error;
    }
  });
