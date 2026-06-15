import type { BambuConfig } from "@/lib/printers/bambu-driver";
import { PrinterManager } from "@/lib/printers/print-manager";
import type { PrusaConfig } from "@/lib/printers/prusa-driver";
import { type FilamentSlot, type Material, type PrinterConfig, type PrinterStatus, type QueueType } from "@/lib/printers/types";
import e from "@packages/db/edgeql-js";
import db from '@/db'

// This file just kept growing `\_(*-*)_/`

type PrinterRecord = { id: string; connected: boolean };

export class PrinterConflictError extends Error {
    constructor(public readonly field: "name" | "ip", public readonly value: string) {
        super(`A printer with ${field} "${value}" already exists`);
        this.name = "PrinterConflictError";
    }
}

export class PrinterNotFoundError extends Error {
    constructor(public readonly printerName: string) {
        super(`A printer named "${printerName}" doesn't exist`);
        this.name = "PrinterNotFoundError";
    }
}

export const printManager = new PrinterManager();
export const printers = new Map<string, PrinterRecord>();
let checkDTInterval: NodeJS.Timeout;
let unsubscribeStatus: (() => void) | null = null;
const lastSyncedState = new Map<string, PrinterStatus["state"]>();

let setupPromise: Promise<Map<string, PrinterRecord>> | null = null;

export function setupPrinters(): Promise<Map<string, PrinterRecord>> {
    setupPromise ??= runSetup();
    return setupPromise;
}

type PrinterRow = {
    id: string;
    name: string;
    ip: string;
    keys: string[];
    manufacturer: string;
    has_camera: boolean;
    filament_slots:  {
        material: string;
        colour: string;
        nozzle_temp_min: number;
        nozzle_temp_max: number;
        bed_temp: number;
    }[];
};

function buildConfig(printer: PrinterRow): PrusaConfig | BambuConfig {
    const slots: FilamentSlot[] = printer.filament_slots.map((slot, index) => ({
        slotId: index,
        filamentType: slot.material as Material,
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
        ip: printer.ip,
        slots,
        queue,
    };

    return base.manufacturer === "PRUSA"
        ? { ...base, username: printer.keys[0], password: printer.keys[1] }
        : { ...base, serial: printer.keys[0], password: printer.keys[1] };
}

const PrinterConfigShape = e.shape(e.printing.Printer, () => ({
    id: true,
    name: true,
    ip: true,
    keys: true,
    manufacturer: true,
    has_camera: true,
    filament_slots: true,
}));

function beginDTCheck(): NodeJS.Timeout {
    return setInterval(async () => {
        for (const [name, record] of printers) {
            const uuid = record.id;
            const finished = await e
                .update(e.printing.Downtime, (d) => ({
                    filter: e.op(
                        e.op(
                            e.op(d.printer.id, "=", e.uuid(uuid)),
                            "and",
                            e.op(d.has_finished, "=", false),
                        ),
                        "and",
                        e.op(e.op(d.end_time, "<=", e.datetime_current()), "??", false),
                    ),
                    set: { has_finished: true },
                }))
                .run(db);
            const started = await e
                .update(e.printing.Downtime, (d) => ({
                    filter: e.op(
                        e.op(
                            e.op(d.printer.id, "=", e.uuid(uuid)),
                            "and",
                            e.op(d.has_started, "=", false),
                        ),
                        "and",
                        e.op(
                            e.op(d.start_time, "<=", e.datetime_current()),
                            "and",
                            e.op(e.op(d.end_time, ">", e.datetime_current()), "??", true),
                        ),
                    ),
                    set: { has_started: true },
                }))
                .run(db);
            const active = e.select(e.printing.Downtime, (d) => ({
                filter: e.op(
                    e.op(d.printer.id, "=", e.uuid(uuid)),
                    "and",
                    e.op(
                        e.op(d.has_started, "=", true),
                        "and",
                        e.op(d.has_finished, "=", false),
                    ),
                ),
            }));
            const state = await e
                .select({
                    down: e.op("exists", active),
                    openEnded: e.op("exists", e.select(active, (a) => ({
                        filter: e.op("not", e.op("exists", a.end_time)),
                    }))),
                    latestEnd: e.max(active.end_time),
                    failed: e.op("exists", e.select(e.printing.Printer, (p) => ({
                        filter: e.op(
                            e.op(p.id, "=", e.uuid(uuid)),
                            "and",
                            e.op("exists", p.status.is(e.printing.printer_status.Failed)),
                        ),
                    }))),
                })
                .run(db);
            if (started.length > 0 && state.down && !state.failed) {
                const status = state.openEnded || !state.latestEnd
                    ? e.insert(e.printing.printer_status.Disabled, {})
                    : e.insert(e.printing.printer_status.Disabled, { end_time: state.latestEnd });
                await e
                    .with(
                        [status],
                        e.select({
                            printer: e.update(e.printing.Printer, () => ({
                                filter_single: { id: uuid },
                                set: { status },
                            })),
                            audit: e.insert(e.printing.PrinterAuditEntry, {
                                printer: e.assert_exists(
                                    e.select(e.printing.Printer, () => ({ filter_single: { id: uuid } })),
                                ),
                                status,
                            }),
                        }),
                    )
                    .run(db);
            }
            if (finished.length > 0 && !state.down && !state.failed) {
                const status = printManager.isConnected(name)
                    ? e.insert(e.printing.printer_status.Idle, {})
                    : e.insert(e.printing.printer_status.Disconnected, {});
                await e
                    .with(
                        [status],
                        e.select({
                            printer: e.update(e.printing.Printer, () => ({
                                filter_single: { id: uuid },
                                set: { status },
                            })),
                            audit: e.insert(e.printing.PrinterAuditEntry, {
                                printer: e.assert_exists(
                                    e.select(e.printing.Printer, () => ({ filter_single: { id: uuid } })),
                                ),
                                status,
                            }),
                        }),
                    )
                    .run(db);
            }
            if (printManager.isConnected(name)) {
                if (state.down) printManager.disable(name);
                else printManager.enable(name);
            }
        }
    }, 60000);
}

export async function stopDBCheck(): Promise<void> {
    clearInterval(checkDTInterval);
    unsubscribeStatus?.();
    unsubscribeStatus = null;
    lastSyncedState.clear();
}

function statusToDb(status: PrinterStatus) {
    switch (status.state) {
        case "idle":
            return e.insert(e.printing.printer_status.Idle, {});
        case "paused":
            return e.insert(e.printing.printer_status.Paused, {});
        case "disconnected":
            return e.insert(e.printing.printer_status.Disconnected, {});
        case "error":
            return e.insert(e.printing.printer_status.Failed, {
                reason: e.printing.printer_status.FailureReason.OTHER,
                note: status.errors?.join("\n") ?? "Unknown error",
            });
        case "printing":
        case "finished": {
            const uuid = status.currentJob?.printJob.uuid;
            if (!uuid) return null;
            const print = e.assert_exists(
                e.select(e.printing.Print, () => ({ filter_single: { id: uuid } })),
            );
            return status.state === "printing"
                ? e.insert(e.printing.printer_status.Printing, { print })
                : e.insert(e.printing.printer_status.Finished, { print });
        }
        default:
            return null;
    }
}

function syncStatusWithDb(): () => void {
    return printManager.subscribeToStatus(async (name, status) => {
        const record = printers.get(name);
        if (!record) return;
        if (lastSyncedState.get(name) === status.state) return;
        const dbStatus = statusToDb(status);
        if (dbStatus) {
            const failed = await e
                .select(e.op("exists", e.select(e.printing.Printer, (p) => ({
                    filter: e.op(
                        e.op(p.id, "=", e.uuid(record.id)),
                        "and",
                        e.op("exists", p.status.is(e.printing.printer_status.Failed)),
                    ),
                }))))
                .run(db);
            if (failed) return;
            try {
                await e
                    .with(
                        [dbStatus],
                        e.select({
                            printer: e.update(e.printing.Printer, () => ({
                                filter_single: { id: record.id },
                                set: { status: dbStatus },
                            })),
                            audit: e.insert(e.printing.PrinterAuditEntry, {
                                printer: e.assert_exists(
                                    e.select(e.printing.Printer, () => ({
                                        filter_single: { id: record.id },
                                    })),
                                ),
                                status: dbStatus,
                            }),
                        }),
                    )
                    .run(db);
            } catch {
                return;
            }
        }
        lastSyncedState.set(name, status.state);
    });
}

async function runSetup(): Promise<Map<string, PrinterRecord>> {
    const rows = await e.select(e.printing.Printer, PrinterConfigShape).run(db);
    for (const printer of rows) {
        const name = await printManager.addPrinter(buildConfig(printer));
        printers.set(name, { id: printer.id, connected: printManager.isConnected(name) });
    }
    unsubscribeStatus = syncStatusWithDb();
    checkDTInterval = beginDTCheck();
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

type PrinterDetails = {
    model: string;
    location: string;
};

export async function addPrinter(config: PrinterConfig, details: PrinterDetails, connect = true): Promise<boolean> {
    const clash = await e
        .select(e.printing.Printer, (printer) => ({
            name: true,
            ip: true,
            filter: e.op(
                e.op(printer.name, "=", config.name),
                "or",
                e.op(printer.ip, "=", config.ip),
            ),
        }))
        .run(db);
    if (clash.some((printer) => printer.name === config.name)) {
        throw new PrinterConflictError("name", config.name);
    }
    if (clash.some((printer) => printer.ip === config.ip)) {
        throw new PrinterConflictError("ip", config.ip);
    }
    const keys = config.manufacturer === "PRUSA"
        ? [config.username, config.password]
        : [config.serial, config.password];
    const filament_slots = config.slots.map((slot) => ({
        material: slot.filamentType,
        colour: slot.colour,
        nozzle_temp_min: slot.nozzleTempMin,
        nozzle_temp_max: slot.nozzleTempMax,
        bed_temp: slot.bedTemp,
    }));
    const inserted = await e
        .insert(e.printing.Printer, {
            name: config.name,
            ip: config.ip,
            keys,
            manufacturer: config.manufacturer,
            model: details.model,
            has_camera: config.hasCamera,
            status: e.insert(e.printing.printer_status.Disconnected, {}),
            filament_slots,
            location: e.assert_exists(
                e.select(e.sign_in.Location, (location) => ({
                    filter_single: e.op(location.name, "=", e.cast(e.sign_in.LocationName, details.location)),
                })),
            ),
            total_print_mass: e.float32(0),
            total_print_time: e.cast(e.duration, e.str("PT0S")),
        })
        .run(db);
    printers.set(config.name, { id: inserted.id, connected: false });
    if (!connect) return false;
    return connectPrinter(inserted.id);
}

export async function removePrinter(name: string): Promise<void> {
    await printManager.removePrinter(name);
    const deleted = await e
        .delete(e.printing.Printer, (printer) => ({
            filter: e.op(printer.name, "=", name),
        }))
        .run(db);
    if (deleted.length === 0) throw new PrinterNotFoundError(name);
    printers.delete(name);
}