import { type BambuConfig, BambuDriver } from "@/lib/printers/bambu-driver";
import { type OctoprintConfig, OctoprintDriver } from "@/lib/printers/octoprint-driver";
import { type PrusaConfig, PrusaDriver } from "@/lib/printers/prusa-driver";
import type { Filament, PrinterConfig, PrinterDriver, PrinterFile, PrinterStatus, PrintJob } from "./types";

type ManagedConfig = PrusaConfig | OctoprintConfig | BambuConfig;

/* 
Singleton manager for multiple printers
Add protection ontop of drivers, e.g. duplicate name protection
Early catch if printer name doesn't exist
Hides connection management behind adding and removing printers, to ensure proper cleanup of connections
Functions are otherwise abstracted from the drivers, so as long as you know the name, you can call the same functions regardless of printer type
Additional functions to retrieve printer/s by all or name
*/
export class PrinterManager {
  private drivers = new Map<string, PrinterDriver>();
  private unsubscribes = new Map<string, () => void>();
  private status_listeners = new Set<(name: string, status: PrinterStatus) => void>();

  async addPrinter(config: ManagedConfig): Promise<string> {
    const { name } = config;
    if (this.drivers.has(name)) {
      return name;
    }

    let driver: PrinterDriver;
    switch (config.driver) {
      case "OCTOPRINT":
        driver = new OctoprintDriver(config as OctoprintConfig);
        break;
      case "PRUSALINK":
        driver = new PrusaDriver(config as PrusaConfig);
        break;
      case "BAMBU":
        driver = new BambuDriver(config as BambuConfig);
        break;
      default:
        throw new Error(`No matching driver for ${config.driver}`);
    }

    try {
      await driver.connect();
    } catch {
      return name;
    }

    const unsub = driver.subscribeToStatus((status) => {
      for (const listener of this.status_listeners) listener(name, status);
    });

    this.drivers.set(name, driver);
    this.unsubscribes.set(name, unsub);
    return name;
  }

  async removePrinter(name: string): Promise<void> {
    const driver = this.drivers.get(name);
    if (!driver) return;
    this.unsubscribes.get(name)?.();
    this.unsubscribes.delete(name);
    await driver.disconnect();
    this.drivers.delete(name);
  }

  get Printers(): string[] {
    return [...this.drivers.keys()];
  }

  subscribeToStatus(callback: (name: string, status: PrinterStatus) => void): () => void {
    this.status_listeners.add(callback);
    return () => {
      this.status_listeners.delete(callback);
    };
  }

  // Early error catch if printer name doesn't exist
  private require(name: string): PrinterDriver {
    const driver = this.drivers.get(name);
    if (!driver) throw new Error(`Printer "${name}" not found`);
    return driver;
  }

  isConnected(name: string): boolean {
    return this.drivers.get(name)?.isConnected() ?? false;
  }

  disable(name: string): void {
    this.require(name).disable();
  }

  enable(name: string): void {
    this.require(name).enable();
  }

  sendJob(name: string, job: PrintJob, timelapse?: boolean): Promise<string> {
    return this.require(name).sendJob(job, timelapse);
  }

  private async activeJob(name: string): Promise<{ driver: PrinterDriver; jobId: string }> {
    const driver = this.require(name);
    const { current_job } = await driver.getStatus();
    if (!current_job) throw new Error(`Printer "${name}" has no active job`);
    return { driver, jobId: current_job.print_job.job_id };
  }

  async cancelJob(name: string): Promise<void> {
    const { driver, jobId } = await this.activeJob(name);
    return driver.cancelJob(jobId);
  }

  async pauseJob(name: string): Promise<void> {
    const { driver, jobId } = await this.activeJob(name);
    return driver.pauseJob(jobId);
  }

  async resumeJob(name: string): Promise<void> {
    const { driver, jobId } = await this.activeJob(name);
    return driver.resumeJob(jobId);
  }

  async finishJob(name: string): Promise<void> {
    const driver = this.require(name);
    const { current_job } = await driver.getStatus();
    return driver.finishJob(current_job?.print_job.job_id ?? "");
  }

  restoreJob(name: string, job: PrintJob): void {
    this.require(name).restoreJob(job);
  }

  getConfig(printerName: string): PrinterConfig | null {
    return this.require(printerName).Config;
  }

  getActiveJob(name: string): PrintJob | null {
    return this.require(name).ActiveJob;
  }

  getStatus(name: string, fresh?: boolean): Promise<PrinterStatus> {
    return this.require(name).getStatus(fresh);
  }

  subscribeToPrinter(name: string, callback: (status: PrinterStatus) => void): () => void {
    return this.require(name).subscribeToStatus(callback);
  }

  uploadFile(name: string, file: Buffer, filename: string, print?: boolean): Promise<string> {
    return this.require(name).uploadFile(file, filename, print);
  }

  async retrieveTimelapse(name: string, printName: string): Promise<Buffer | null> {
    const driver = this.require(name);
    if (driver instanceof OctoprintDriver) return driver.retrieveTimelapse(printName);
    return null;
  }

  listFiles(name: string): Promise<PrinterFile[]> {
    return this.require(name).listFiles();
  }

  deleteFile(name: string, filename: string): Promise<void> {
    return this.require(name).deleteFile(filename);
  }

  updateSlot(name: string, slotId: number, slot: Filament): Promise<void> {
    return this.require(name).updateSlot(slotId, slot);
  }

  syncSlots(name: string): Promise<Filament[]> {
    const driver = this.require(name);
    const config = driver.Config;
    if (!config) throw new Error(`Failed to retrieve config of printer: ${name}`);
    if (config.driver !== "BAMBU") throw new Error("Can only sync slots of AMS printers");
    return driver.syncSlots();
  }
}
