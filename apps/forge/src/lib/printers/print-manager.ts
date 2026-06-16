import { type BambuConfig, BambuDriver } from "@/lib/printers/bambu-driver";
import { type PrusaConfig, PrusaDriver } from "@/lib/printers/prusa-driver";
import type { FilamentSlot, PrinterConfig, PrinterDriver, PrinterFile, PrinterStatus, PrintJob } from "./types";

type ManagedConfig = PrusaConfig | BambuConfig;

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
  private statusListeners = new Set<(name: string, status: PrinterStatus) => void>();

  async addPrinter(config: ManagedConfig): Promise<string> {
    const { name } = config;
    if (this.drivers.has(name)) {
      return name;
    }

    const driver: PrinterDriver =
      config.manufacturer === "PRUSA" ? new PrusaDriver(config as PrusaConfig) : new BambuDriver(config as BambuConfig);

    try {
      await driver.connect();
    } catch (error) {
      console.error(`Printer "${name}" failed to connect:`, error);
      return name;
    }

    const unsub = driver.subscribeToStatus((status) => {
      for (const listener of this.statusListeners) listener(name, status);
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
    this.statusListeners.add(callback);
    return () => {
      this.statusListeners.delete(callback);
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
    const { currentJob } = await driver.getStatus();
    if (!currentJob) throw new Error(`Printer "${name}" has no active job`);
    return { driver, jobId: currentJob.printJob.jobid };
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
    const { currentJob } = await driver.getStatus();
    return driver.finishJob(currentJob?.printJob.jobid ?? "");
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

  listFiles(name: string): Promise<PrinterFile[]> {
    return this.require(name).listFiles();
  }

  deleteFile(name: string, filename: string): Promise<void> {
    return this.require(name).deleteFile(filename);
  }

  updateSlot(name: string, slotId: number, slot: FilamentSlot): Promise<void> {
    return this.require(name).updateSlot(slotId, slot);
  }

  syncSlots(name: string): Promise<FilamentSlot[]> {
    const driver = this.require(name);
    const config = driver.Config;
    if (!config) throw new Error(`Failed to retrieve config of printer: ${name}`);
    if (config.queue !== "MULTI") throw new Error("Can only sync slots of ams printers");
    return driver.syncSlots();
  }
}
