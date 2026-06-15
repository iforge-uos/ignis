import { threeDP } from "@/orpc";
import { PrinterNotFoundError, removePrinter } from "@/printing";
import * as z from "zod";

export const remove = threeDP
    .errors({
        PRINTER_NOT_FOUND: {
            status: 404,
            message: "Printer not found",
            data: z.object({ name: z.string() }),
        },
    })
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

        return { success: true };
    });