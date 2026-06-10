import { threeDP } from "@/orpc";
import { printManager, printers , connectPrinter} from "@/printing";
import * as z from "zod";

export const connect = threeDP
    .errors({
        PRINTER_NOT_FOUND: {
            status: 404,
            message: "Printer not found",
            data: z.object({ name: z.string() }),
        },
        CONNECTION_FAILED: {
            status: 502,
            message: "Failed to connect to printer",
        },
    })
    .route({ method: "POST", path: "/{name}" })
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
        return { success: true };
});

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
    .route({method: "DELETE", path: "/{name}" })
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

export const reconnect = threeDP
    .errors({
        PRINTER_NOT_FOUND: {
            status: 404,
            message: "Printer not found",
            data: z.object({ name: z.string() }),
        },
        DISCONNECT_FAILURE: {
            status: 502,
            message: "Failed to disconnect",
        },
        CONNECTION_FAILED: {
            status: 502,
            message: "Failed to connect to printer",
        },
    })
    .route({ method: "PATCH", path: "/{name}" })
    .input(z.object({ name: z.string().min(1) }))
    .handler(async ({ input: { name }, errors }) => {
        const printer = printers.get(name);
        if (!printer) throw errors.PRINTER_NOT_FOUND({ data: { name } });
        try {
            await printManager.removePrinter(name);
            printers.set(name, {id: printer.id, connected: false});
        } catch {
            throw errors.DISCONNECT_FAILURE();
        }
        let connected: boolean;
        try {
            connected = await connectPrinter(printer.id);
        } catch {
            throw errors.CONNECTION_FAILED();
        }
        if (!connected) throw errors.CONNECTION_FAILED();
        return { success: true };
});

