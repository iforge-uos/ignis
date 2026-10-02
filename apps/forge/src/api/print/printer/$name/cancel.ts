import * as z from "zod";
import { printing } from "@/orpc";
import { printers, printManager } from "@/printing";

export const cancel = printing
  .route({ method: "PATCH", path: "/cancel" })
  .input(z.object({ name: z.string().min(1) }))
  .handler(async ({ input: { name }, errors }) => {
    if (!printers.has(name)) throw errors.PRINTER_NOT_FOUND({ data: { name } });
    if (!printManager.Printers.includes(name)) throw errors.PRINTER_DISCONNECTED();

    const status = await printManager.getStatus(name);
    if (status.state === "disconnected") throw errors.PRINTER_DISCONNECTED();
    if (status.state === "disabled") throw errors.PRINTER_DISABLED();
    if (!status.current_job) throw errors.PRINT_JOB_NOT_FOUND();

    try {
      await printManager.cancelJob(name);
    } catch {
      throw errors.COMMAND_FAILED();
    }
  });
