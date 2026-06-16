import { QueueTypeSchema } from "@packages/db/zod/modules/printing";
import * as z from "zod";
import { filamentSlotSchema } from "@/lib/printers/utils";
import { printing } from "@/orpc";
import { printers, printManager } from "@/printing";

const configOutput = z.object({
  ip: z.string().min(1),
  name: z.string().min(1),
  manufacturer: z.enum(["PRUSA", "BAMBU"]),
  slots: z.array(filamentSlotSchema),
  queue: QueueTypeSchema,
  hasCamera: z.boolean(),
});

export const config = printing
  .route({ method: "GET", path: "/config" })
  .input(z.object({ name: z.string().min(1) }))
  .output(configOutput)
  .handler(async ({ input: { name }, errors }) => {
    if (!printers.has(name)) throw errors.PRINTER_NOT_FOUND({ data: { name } });
    if (!printManager.Printers.includes(name)) throw errors.PRINTER_DISCONNECTED();
    const config = printManager.getConfig(name);
    if (!config) throw errors.COMMAND_FAILED();
    return config;
  });
