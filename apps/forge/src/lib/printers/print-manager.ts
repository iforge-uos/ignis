import { type BambuConfig, BambuDriver } from '@/lib/printers/bambu-driver'
import { type PrusaConfig, PrusaDriver } from '@/lib/printers/prusa-driver'
import type { FilamentSlot, PrinterConfig, PrinterDriver, PrinterFile, PrinterStatus, PrintJob } from './types'

type ManagedConfig = PrusaConfig | BambuConfig;

export class PrinterManager {
    private drivers = new Map<string, PrinterDriver>();
    private unsubscribes = new Map<string, () => void>();
    private statusListeners = new Set<(name: string, status: PrinterStatus) => void>();

    async addPrinter(config: ManagedConfig): Promise<string> {
        const { name } = config;
        if (this.drivers.has(name)) {
            throw new Error(`Printer "${name}" already added`);
        }

        let driver: PrinterDriver;
        if ('apiKey' in config) {
            driver = new PrusaDriver();
            await driver.connect(config);
        } else if ('password' in config && 'serial' in config) {
            driver = new BambuDriver();
            await driver.connect(config);
        } else {
            throw new Error(`Printer config for "${name}" did not match a known driver shape`);
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

    getPrinter(name: string): PrinterDriver | undefined {
        return this.drivers.get(name);
    }

    listPrinters(): string[] {
        return [...this.drivers.keys()];
    }

    subscribeToStatus(callback: (name: string, status: PrinterStatus) => void): () => void {
        this.statusListeners.add(callback);
        return () => { this.statusListeners.delete(callback); };
    }

    private require(name: string): PrinterDriver {
        const driver = this.drivers.get(name);
        if (!driver) throw new Error(`Printer "${name}" not found`);
        return driver;
    }

    isConnected(name: string): boolean {
        return this.require(name).isConnected();
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

    cancelJob(name: string, jobId: string): Promise<void> {
        return this.require(name).cancelJob(jobId);
    }

    pauseJob(name: string, jobId: string): Promise<void> {
        return this.require(name).pauseJob(jobId);
    }

    resumeJob(name: string, jobId: string): Promise<void> {
        return this.require(name).resumeJob(jobId);
    }

    finishJob(name: string, jobId: string): Promise<void> {
        return this.require(name).finishJob(jobId);
    }

    getConfig(name: string): PrinterConfig | null {
        return this.require(name).getConfig();
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
}
