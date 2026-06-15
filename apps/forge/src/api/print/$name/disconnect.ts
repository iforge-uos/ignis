import { threeDP } from "@/orpc";
import { printManager, printers } from "@/printing";
import * as z from "zod";

export const disconnect = threeDP
    .errors({
        PRINTER_NOT_FOUND: {
            status: 404,
            message: "Printer not found",
            data: z.object({ name: z.string() }),
        },
        DISCONNECT_FAILURE: {
            status: 502,
            message: "Failed to disconnect",
        }
    })
    .route({method: "DELETE", path: "/disconnect" })
    .input(z.object({name: z.string().min(1)}))
    .handler(async ({ input: { name }, errors }) => {
        const printer = printers.get(name);
        if (!printer) throw errors.PRINTER_NOT_FOUND({ data: { name } });
        try {
            await printManager.removePrinter(name);
            printers.set(name, {id: printer.id, connected: false});
        } catch {
            throw errors.DISCONNECT_FAILURE();
        }
        return { success: true };
});

