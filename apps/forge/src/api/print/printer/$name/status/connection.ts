import * as z from "zod";
import { printing } from "@/orpc";
import { printers, printManager } from "@/printing";

export const connection = printing
  .route({ method: "GET", path: "/connection" })
  .input(z.object({ name: z.string().min(1) }))
  .output(z.boolean())
  .handler(async ({ input: { name }, errors }) => {
    if (!printers.has(name)) throw errors.PRINTER_NOT_FOUND({ data: { name } });
    if (!printManager.Printers.includes(name)) throw errors.PRINTER_DISCONNECTED();
    const bool = printManager.isConnected(name);
    return bool;
  });
