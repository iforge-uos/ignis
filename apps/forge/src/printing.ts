import e, { $infer } from "@packages/db/edgeql-js";
import type { printing, sign_in } from "@packages/db/interfaces";
import db from "@/db";
import type { BambuConfig } from "@/lib/printers/bambu-driver";
import type { OctoprintConfig } from "@/lib/printers/octoprint-driver";
import { PrinterManager } from "@/lib/printers/print-manager";
import { type PrinterConfig, type PrinterStatus, type PrintJob } from "@/lib/printers/types";
import { toFilamentSlots } from "@/lib/printers/utils";

// This file just kept growing `\_(*-*)_/`

type PrinterRecord = { id: string; connected: boolean; queue: printing.QueueType };

export class PrinterConflictError extends Error {
  constructor(
    public readonly field: "name" | "ip",
    public readonly value: string,
  ) {
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

// Middleware for print api calls
export function setupPrinters(): Promise<Map<string, PrinterRecord>> {
  setupPromise ??= runSetup();
  return setupPromise;
}

const PrinterConfigShape = e.shape(e.printing.Printer, () => ({
  id: true,
  name: true,
  ip: true,
  keys: true,
  manufacturer: true,
  has_camera: true,
  filament: true,
  queue: true,
}));

type PrinterRow = $infer<typeof PrinterConfigShape>[number];

// No nice way to convert
function buildConfig(printer: PrinterRow): OctoprintConfig | BambuConfig {
  const base = {
    name: printer.name,
    ip: printer.ip,
    manufacturer: printer.manufacturer as printing.Manafacturers,
    has_camera: printer.has_camera,
    queue: printer.queue,
    filament: printer.filament.map((f, i) => ({ ...f, slot_id: i })),
  };

  switch (printer.manufacturer) {
    case "PRUSA":
      return { ...base, username: printer.keys[0], password: printer.keys[1] };
    case "BAMBU":
      return { ...base, serial: printer.keys[0], password: printer.keys[1] };
    default:
      throw new Error(`Unknown manufacturer "${printer.manufacturer}"`);
  }
}

function beginDTCheck(): NodeJS.Timeout {
  return setInterval(async () => {
    for (const [name, record] of printers) {
      const uuid = record.id;
      const active = e.select(e.printing.Downtime, (d) => ({
        filter: e.all(e.set(e.op(d.printer.id, "=", e.uuid(uuid)), d.has_started, e.op("not", d.has_finished))),
      }));
      const state = await e
        .select({
          down: e.op("exists", active),
          open_ended: e.op(
            "exists",
            e.select(active, (a) => ({
              filter: e.op("not", e.op("exists", a.end_time)),
            })),
          ),
          latest_end: e.max(active.end_time),
          failed: e.op(
            "exists",
            e.select(e.printing.Printer, (p) => ({
              filter: e.op(
                e.op(p.id, "=", e.uuid(uuid)),
                "and",
                e.op("exists", p.status.is(e.printing.printer_status.Failed)),
              ),
            })),
          ),
          disabled: e.op(
            "exists",
            e.select(e.printing.Printer, (p) => ({
              filter: e.op(
                e.op(p.id, "=", e.uuid(uuid)),
                "and",
                e.op("exists", p.status.is(e.printing.printer_status.Disabled)),
              ),
            })),
          ),
        })
        .run(db);
      if (!state.failed) {
        if (state.down && !state.disabled) {
          const status =
            state.open_ended || !state.latest_end
              ? e.insert(e.printing.printer_status.Disabled, {})
              : e.insert(e.printing.printer_status.Disabled, { end_time: state.latest_end });
          await e
            .select({
              printer: e.update(e.printing.Printer, () => ({
                filter_single: { id: uuid },
                set: { status },
              })),
              audit: e.insert(e.printing.PrinterAuditEntry, {
                printer: e.assert_exists(e.select(e.printing.Printer, () => ({ filter_single: { id: uuid } }))),
                status,
              }),
            })
            .run(db);
        } else if (!state.down && state.disabled) {
          const status = printManager.isConnected(name)
            ? e.insert(e.printing.printer_status.Idle, {})
            : e.insert(e.printing.printer_status.Disconnected, {});
          await e
            .select({
              printer: e.update(e.printing.Printer, () => ({
                filter_single: { id: uuid },
                set: { status },
              })),
              audit: e.insert(e.printing.PrinterAuditEntry, {
                printer: e.assert_exists(e.select(e.printing.Printer, () => ({ filter_single: { id: uuid } }))),
                status,
              }),
            })
            .run(db);
        }
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
      const uuid = status.current_job?.print_job.uuid;
      if (!uuid) return null;
      const print = e.assert_exists(e.select(e.printing.Print, () => ({ filter_single: { id: uuid } })));
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
        .select(
          e.op(
            "exists",
            e.select(e.printing.Printer, (p) => ({
              filter: e.op(
                e.op(p.id, "=", e.uuid(record.id)),
                "and",
                e.op("exists", p.status.is(e.printing.printer_status.Failed)),
              ),
            })),
          ),
        )
        .run(db);
      if (failed) return;
      try {
        await e
          .select({
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
          })
          .run(db);
      } catch {
        return;
      }
    }
    lastSyncedState.set(name, status.state);
  });
}

async function restoreActiveJob(name: string, printerId: string): Promise<void> {
  if (!printManager.isConnected(name)) return;
  const active = await e
    .select(e.printing.PrintHistory, (h) => ({
      queue: true,
      print: e.assert_exists(
        e.assert_single(
          e.select(h["<on[is printing::Print]"], () => ({
            id: true,
            name: true,
            gcode_path: true,
            filament: true,
          })),
        ),
      ),
      filter: e.op(
        e.op(h.printer.id, "=", e.uuid(printerId)),
        "and",
        e.op("exists", h.status.is(e.printing.print_status.Printing)),
      ),
    }))
    .run(db);
  const current = active[0];
  if (!current) return;
  const job: PrintJob = {
    job_id: "0",
    uuid: current.print.id,
    name: current.print.name,
    gcode_url: current.print.gcode_path,
    filament: toFilamentSlots(current.print.filament),
    queue: current.queue,
  };
  printManager.restoreJob(name, job);
  await printManager.getStatus(name, true);
}

async function runSetup(): Promise<Map<string, PrinterRecord>> {
  const rows = await e.select(e.printing.Printer, PrinterConfigShape).run(db);
  for (const printer of rows) {
    const name = await printManager.addPrinter(buildConfig(printer));
    printers.set(name, { id: printer.id, connected: printManager.isConnected(name), queue: printer.queue });
    await restoreActiveJob(name, printer.id);
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
  printers.set(name, { id: printer.id, connected: printManager.isConnected(name), queue: printer.queue });
  await restoreActiveJob(name, printer.id);
  return printManager.isConnected(name);
}

type PrinterDetails = {
  model: string;
  location: sign_in.LocationName;
};

export async function addPrinter(config: PrinterConfig, details: PrinterDetails, connect = true): Promise<boolean> {
  const clash = await e
    .select(e.printing.Printer, (printer) => ({
      name: true,
      ip: true,
      filter: e.op(e.op(printer.name, "=", config.name), "or", e.op(printer.ip, "=", config.ip)),
    }))
    .run(db);
  if (clash.some((printer) => printer.name === config.name)) {
    throw new PrinterConflictError("name", config.name);
  }
  if (clash.some((printer) => printer.ip === config.ip)) {
    throw new PrinterConflictError("ip", config.ip);
  }
  const { ip, name, manufacturer, has_camera, filament } = config;

  let keys: string[];
  switch (config.manufacturer) {
    case "PRUSA":
      keys = [(config as OctoprintConfig).username, (config as OctoprintConfig).password];
      break;
    case "BAMBU":
      keys = [(config as BambuConfig).serial, (config as BambuConfig).password];
      break;
    default:
      throw new Error(`Unknown manufacturer "${config.manufacturer}"`);
  }
  const inserted = await e
    .select(
      e.insert(e.printing.Printer, {
        ip,
        name,
        manufacturer,
        has_camera,
        keys,
        filament: filament.map(({ slot_id, ...slot }) => slot),
        model: details.model,
        status: e.insert(e.printing.printer_status.Disconnected, {}),
        location: e.select(e.sign_in.Location, () => ({ filter_single: { name: details.location } })),
        total_print_mass: e.float32(0),
        total_print_time: e.cast(e.duration, e.str("PT0S")),
      }),
      () => ({ id: true, queue: true }),
    )
    .run(db);
  printers.set(config.name, { id: inserted.id, connected: false, queue: inserted.queue });
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
