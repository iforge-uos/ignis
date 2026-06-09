import type { BambuConfig } from "@/lib/printers/bambu-driver";
import { PrinterManager } from "@/lib/printers/print-manager";
import type { PrusaConfig } from "@/lib/printers/prusa-driver";
import { type FilamentSlot, Material, type QueueType } from "@/lib/printers/types";
import e from "@packages/db/edgeql-js";
import db from '@/db'
import { getEnvVariable } from "@/lib/utils/config";

type PrinterRecord = { id: string; connected: boolean };

export const printManager = new PrinterManager();
export const printers = new Map<string, PrinterRecord>();

let setupPromise: Promise<Map<string, PrinterRecord>> | null = null;

export function setupPrinters(): Promise<Map<string, PrinterRecord>> {
    setupPromise ??= runSetup();
    return setupPromise;
}

type PrinterRow = {
    id: string;
    name: string;
    manufacturer: string;
    has_camera: boolean;
    filament_slots: readonly {
        "@position": number;
        material: string;
        colour: string;
        nozzle_temp_min: number;
        nozzle_temp_max: number;
        bed_temp: number;
    }[];
};

function buildConfig(printer: PrinterRow): PrusaConfig | BambuConfig {
    const key = printer.name.toUpperCase();

    const slots: FilamentSlot[] = printer.filament_slots.map((slot) => ({
        slotId: slot["@position"],
        filamentType: Material[slot.material as keyof typeof Material],
        colour: slot.colour,
        nozzleTempMin: slot.nozzle_temp_min,
        nozzleTempMax: slot.nozzle_temp_max,
        bedTemp: slot.bed_temp,
    }));

    const queue: QueueType = slots.length > 1 ? "MULTI" : slots[0].filamentType;

    const base = {
        name: printer.name,
        manufacturer: printer.manufacturer as "PRUSA" | "BAMBU",
        hasCamera: printer.has_camera,
        slots,
        queue,
    };

    return base.manufacturer === "PRUSA"
        ? { ...base, ip: getEnvVariable(`${key}_IP`), apiKey: getEnvVariable(`${key}_APIKEY`) }
        : { ...base, ip: getEnvVariable(`${key}_IP`), serial: getEnvVariable(`${key}_SERIAL`), password: getEnvVariable(`${key}_PASSWORD`) };
}

const PrinterConfigShape = e.shape(e.printing.Printer, () => ({
    id: true,
    name: true,
    manufacturer: true,
    has_camera: true,
    filament_slots: (slot) => ({
        "@position": true,
        material: true,
        colour: true,
        nozzle_temp_min: true,
        nozzle_temp_max: true,
        bed_temp: true,
        order_by: slot["@position"],
    }),
}));

async function runSetup(): Promise<Map<string, PrinterRecord>> {
    const rows = await e.select(e.printing.Printer, PrinterConfigShape).run(db);
    for (const printer of rows) {
        const name = await printManager.addPrinter(buildConfig(printer));
        printers.set(name, { id: printer.id, connected: printManager.isConnected(name) });
    }
    return printers;
}

export async function connectPrinter(id: string): Promise<boolean> {
    const printer = await e
        .select(e.printing.Printer, (p) => ({ ...PrinterConfigShape(p), filter_single: { id } }))
        .run(db);
    if (!printer) return false;
    const name = await printManager.addPrinter(buildConfig(printer));
    printers.set(name, { id: printer.id, connected: printManager.isConnected(name) });
    return printManager.isConnected(name);
}