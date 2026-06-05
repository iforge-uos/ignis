import { type BambuConfig, BambuDriver } from '@/lib/printers/bambu-driver'
import { type PrusaConfig, PrusaDriver } from '@/lib/printers/prusa-driver'
import type { FilamentSlot, PrinterConfig, PrinterDriver, PrinterFile, PrinterStatus, PrintJob } from './types'

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

    listPrinters(): string[] {
        return [...this.drivers.keys()];
    }

    subscribeToStatus(callback: (name: string, status: PrinterStatus) => void): () => void {
        this.statusListeners.add(callback);
        return () => { this.statusListeners.delete(callback); };
    }

    // Early error catch if printer name doesn't exist
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

    getConfig(printerName: string): PrinterConfig | null {
        const config = this.require(printerName).getConfig();
        if (config) {
            const { ip, name, manufacturer, slots, queue, hasCamera } = config;
            return { ip, name, manufacturer, slots, queue, hasCamera };
        }
        return null;
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
        const config = driver.getConfig();
        if (!config) throw new Error(`Failed to retrieve config of printer: ${name}`);
        if (config.queue !== 'MULTI') throw new Error('Can only sync slots of ams printers');
        return driver.syncSlots();
    }
}
