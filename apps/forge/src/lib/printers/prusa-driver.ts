import type { FilamentSlot, PrinterConfig, PrinterDriver, PrinterFile, PrinterStatus, PrintJob } from '@/lib/printers/types';

export interface PrusaConfig extends PrinterConfig {
    apiKey: string;
}

type PrusaState = 'IDLE' | 'BUSY' | 'PRINTING' | 'PAUSED' | 'FINISHED' | 'STOPPED' | 'ERROR' | 'ATTENTION' | 'READY';

interface PrusaStatusResponse {
    printer: {
        state: PrusaState;
        temp_nozzle: number;
        target_nozzle: number;
        temp_bed: number;
        target_bed: number;
    };
    job?: {
        id: number;
        progress: number;
        time_remaining?: number;
        time_printing?: number;
    };
}

interface PrusaJobResponse {
    id: number;
    state: string;
    progress: number;
    time_remaining?: number;
    time_printing: number;
}

interface PrusaFolderResponse {
    children: Array<{
        name: string;
        size?: number; // absent for folders
        m_timestamp: number;
        type: string; // PRINT_FILE | FIRMWARE | FILE | FOLDER
        display_name?: string;
    }>;
}

const PRUSA_STATE_MAP: Record<PrusaState, PrinterStatus['state']> = {
    IDLE: 'idle',
    READY: 'idle',
    FINISHED: 'finished',
    PRINTING: 'printing',
    BUSY: 'printing',
    PAUSED: 'paused',
    ERROR: 'error',
    STOPPED: 'error',
    ATTENTION: 'error',
}

export class PrusaDriver implements PrinterDriver {
    private config?: PrusaConfig;
    private connected = false;
    private isDisabled = false;
    private currentStatus: PrinterStatus = {state: 'disconnected'};
    private activeJob?: PrintJob;
    private activeFilename?: string;
    private finishHandled = false; // true once finishJob has cleaned up a FINISHED print, until the next job

    private pollInterval: ReturnType<typeof setInterval> | null = null;
    private statusListener = new Set<(status: PrinterStatus) => void>();

    private get baseUrl(): string {
        if (!this.config) throw new Error('Prusa printer config not set');
        return `http://${this.config.ip}/api/v1`;
    }

    private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
        if (!this.config) throw new Error('Prusa printer config not set');
        const response = await fetch(`${this.baseUrl}${path}`, {
            method,
            headers: {
                'X-Api-Key': this.config.apiKey,
                'Content-Type': 'application/json',
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) throw new Error(`Prusa API ${method} ${path}: ${response.status} ${response.statusText}`);
        const text = await response.text();
        return (text ? JSON.parse(text) : undefined) as T;
    }

    async connect(config: PrusaConfig): Promise<void> {
        this.config = config;
        try {
            this.currentStatus = await this.fetchStatus();
        } catch(error) {
            this.connected = false;
            throw new Error(`Failed to connect to Prusa printer "${config.name}" at ${config.ip}: ${error instanceof Error ? error.message : error}`);
        }
        this.connected = true;
        this.startPolling();
    }

    async disconnect(): Promise<void> {
        this.stopPolling();
        this.connected = false;
        const disconnected: PrinterStatus = { state: 'disconnected'};
        this.currentStatus = disconnected;
    }

    isConnected(): boolean {return this.connected;}

    disable(): void {this.isDisabled = true;}
    enable(): void {this.isDisabled = false;}

    async sendJob(job: PrintJob, _timelapse?: boolean): Promise<string> {
        if (this.isDisabled) throw new Error (`Prusa printer ${this.config?.name} is disabled`);
        const filename = `${job.name}.gcode`;
        const gcodeResponse = await fetch(job.gcodeUrl);
        if (!gcodeResponse.ok) throw new Error(`Failed to fetch gcode at ${job.gcodeUrl}: ${gcodeResponse.status}`);
        const buffer = Buffer.from(await gcodeResponse.arrayBuffer());
        await this.uploadFile(buffer,filename,true);
        const prusaJob = await this.waitForJob();
        this.finishHandled = false;
        this.activeJob = job;
        this.activeJob.jobid = String(prusaJob.id);
        this.activeFilename = filename;
        return this.activeJob.jobid;
    }

    async cancelJob(jobId: string): Promise<void> {
        await this.request('DELETE', `/job/${jobId}`);
    }

    async pauseJob(jobId: string): Promise<void> {
        await this.request('PUT', `/job/${jobId}/pause`);
    }

    async resumeJob(jobId: string): Promise<void> {
        await this.request('PUT', `/job/${jobId}/resume`);
    }

    async finishJob(_id: string): Promise<void> {
        const filename = this.activeFilename ?? (this.activeJob ? `${this.activeJob.name}.gcode` : undefined);
        if (!filename) throw new Error('No active filename found');
        await this.deleteFile(filename);
        this.activeFilename = undefined;
        this.activeJob = undefined;
        this.finishHandled = true;
        this.currentStatus = { ...this.currentStatus, state: 'idle' };
        for (const listener of this.statusListener) listener(this.currentStatus);
    }

    getConfig(): PrusaConfig | null {
        return this.config ?? null;
    }

    async getStatus(fresh?: boolean): Promise<PrinterStatus> {
        if (fresh) return this.fetchStatus();
        return this.currentStatus;
    }

    subscribeToStatus(callback: (status: PrinterStatus) => void): () => void {
        this.statusListener.add(callback);
        if (this.currentStatus) callback(this.currentStatus);
        return () => { this.statusListener.delete(callback); };
    }

    async uploadFile(file: Buffer, filename: string, print?: boolean): Promise<string> {
        if (!this.config) throw new Error('Prusa printer config not set');
        const response = await fetch(`${this.baseUrl}/files/local/${encodeURIComponent(filename)}`, {
            method: 'PUT',
            headers: {
                'X-Api-Key': this.config.apiKey,
                'Content-Type': 'application/octet-stream',
                'Content-Length': String(file.length),
                'Print-After-Upload': print ? '?1' : '?0',
                'Overwrite': '?1',
            },
            body: file as unknown as BodyInit,
        });

        if (!response.ok) throw new Error(`Prusa API PUT /files/local/${filename}: ${response.status} ${response.statusText}`);
        return filename;
    }

    async listFiles(): Promise<PrinterFile[]> {
        const data = await this.request<PrusaFolderResponse>('GET','/files/local');
        return data.children
            .filter(c => c.type !== 'FOLDER')
            .map(c => ({
                filename: c.name,
                size: c.size ?? 0,
                uploadedAt: new Date(c.m_timestamp * 1000),
            }));
    }

    async deleteFile(filename: string): Promise<void> {
        await this.request('DELETE', `/files/local/${encodeURIComponent(filename)}`);        
    }

    async updateSlot(slotId: number, filamentSlot: FilamentSlot): Promise<void> {
        if (!this.config) throw new Error('Updating a printer filament slot requires a config');
        const idx = this.config.slots.findIndex(s => s.slotId === slotId);
        if (idx === -1) return;
        this.config.slots[idx] = filamentSlot;
        if (this.config.slots.length === 1) {
            this.config.queue = this.config.slots[0].filamentType;
        }
    }

    private async waitForJob(attempts = 5, delayMs = 500): Promise<PrusaJobResponse> {
        for (let i = 0; i< attempts; i++ ){
            await new Promise(resolve => setTimeout(resolve, delayMs));
            const prusaJob = await this.request<PrusaJobResponse>('GET', '/job');
            if (prusaJob) return prusaJob;
        }
        throw new Error(`Job did not start on ${this.config?.name} after upload`);
    }

    private async fetchStatus(): Promise<PrinterStatus> {
        const rawStatus = await this.request<PrusaStatusResponse>('GET', '/status');
        this.currentStatus = this.mapStatus(rawStatus);
        return this.currentStatus;
    }

    private mapStatus(rawStatus: PrusaStatusResponse): PrinterStatus {
        const mapped = PRUSA_STATE_MAP[rawStatus.printer.state] ?? 'error';
        const state = this.isDisabled ? 'disabled' : (mapped === 'finished' && this.finishHandled ? 'idle' : mapped);
        return {
            state,
            currentJob: rawStatus.job ? {
                printJob: {
                    jobid: String(rawStatus.job.id),
                    uuid: this.activeJob?.uuid ?? '',
                    name: this.activeJob?.name ?? '',
                    gcodeUrl: this.activeJob?.gcodeUrl ?? '',
                    filament: this.config?.slots ?? [],
                    queue: this.config?.queue ?? 0,
                },
                name: this.activeJob?.name ?? '',
                progress: rawStatus.job.progress,
                timeRemaining: rawStatus.job.time_remaining ?? 0,
            } : undefined,
            temperature: {
                nozzle: { current: rawStatus.printer.temp_nozzle, target: rawStatus.printer.target_nozzle },
                bed: { current: rawStatus.printer.temp_bed, target: rawStatus.printer.target_bed },
            },
        };
    }

    private startPolling(): void {
        this.pollInterval = setInterval(async () => {
            try {
                const status = await this.fetchStatus();
                for (const listener of this.statusListener) listener(status);
            } catch {
                const disconnected: PrinterStatus = { state: 'disconnected', errors: ['Connection lost'] };
                this.currentStatus = disconnected;
                for (const listener of this.statusListener) listener(disconnected);
            }
        }, 5000);
    }

    private stopPolling(): void {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
}