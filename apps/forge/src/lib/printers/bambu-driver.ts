import type { FilamentSlot, PrinterConfig, PrinterDriver, PrinterFile, PrinterStatus, PrintJob } from '@/lib/printers/types';
import { Colour, Material } from '@/lib/printers/types';
import { Readable } from "node:stream";
import { Client as FtpClient } from "basic-ftp";
import mqtt, { type MqttClient } from "mqtt";


export interface BambuConfig extends PrinterConfig {
    serial: string;
    password: string;
}

type BambuState = 'IDLE' | 'PREPARE' | 'RUNNING' | 'PAUSE' | 'FINISH' | 'FAILED';

interface BambuAmsTray {
    id: string;
    tray_type?: string;
    tray_color?: string;
    nozzle_temp_min?: string;
    nozzle_temp_max?: string;
    bed_temp?: string;
}

interface BambuAmsUnit {
    id: string;
    humidity?: string;
    temp?: string;
    tray: BambuAmsTray[];
}

interface BambuAms {
    ams: BambuAmsUnit[];
    tray_now?: string;
    tray_tar?: string;
}

export const BAMBU_EXTERNAL_SPOOL = { ams_id: 255, tray_id: 254 } as const;

export const BAMBU_TRAY_TYPE: Record<Material, string> = {
  [Material.PLA]: "PLA",
  [Material.TPU]: "TPU",
  [Material.PETG]: "PETG",
};

export const BAMBU_TRAY_INFO_IDX: Record<Material, string> = {
  [Material.PLA]: "GFL99",
  [Material.TPU]: "GFU99",
  [Material.PETG]: "GFG99",
};

export const BAMBU_TRAY_COLOR: Record<Colour, string> = {
  [Colour.WHITE]: "FFFFFFFF",
  [Colour.BLACK]: "000000FF",
  [Colour.BLUE]: "0000FFFF",
  [Colour.GREEN]: "00FF00FF",
  [Colour.RED]: "FF0000FF",
  [Colour.YELLOW]: "FFFF00FF",
  [Colour.ORANGE]: "FF8000FF",
  [Colour.ANY]: "FFFFFFFF",
};

interface BambuPrintReport {
    command?: string;
    gcode_state?: BambuState;
    mc_percent?: number;
    mc_remaining_time?: number;
    nozzle_temper?: number;
    nozzle_target_temper?: number;
    bed_temper?: number;
    bed_target_temper?: number;
    chamber_temper?: number;
    subtask_name?: string;
    gcode_file?: string;
    layer_num?: number;
    total_layer_num?: number;
    ams?: BambuAms;
}

interface BambuReport {
    print?: BambuPrintReport;
}

const BAMBU_STATE_MAP: Record<BambuState, PrinterStatus['state']> = {
    IDLE: 'idle',
    FINISH: 'finished',
    PREPARE: 'printing',
    RUNNING: 'printing',
    PAUSE: 'paused',
    FAILED: 'error',
}

export class BambuDriver implements PrinterDriver{
    private config?: BambuConfig;
    private client?: MqttClient;
    private connected = false;
    private isDisabled = false;
    private currentStatus: PrinterStatus = { state: "disconnected" };
    private activeJob?: PrintJob;
    private activeFilename?: string;
    private finishHandled = false;
    private latestReport: BambuPrintReport = {};
    private sequenceId = 0;
    private statusListener = new Set<(status: PrinterStatus) => void>();

    private get reportTopic(): string {
        return `device/${this.config?.serial}/report`
    }

    private get requestTopic(): string {
        return `device/${this.config?.serial}/request`;
    }

    private nextSequenceId(): string {
        return String(this.sequenceId++);
    }

    async connect(config: BambuConfig): Promise<void> {
        if (!config) throw new Error('Config required when connecting a printer');
        this.config = config;
        try {
            this.client = await mqtt.connectAsync(`mqtts://${config.ip}:8883`,{
                username: "bblp",
                password: config.password,
                rejectUnauthorized: false,
                reconnectPeriod: 5000,
            });

        } catch (error) {
            this.connected = false;
            throw new Error(`Failed to connect to Bambu printer "${config.name}" at ${config.ip}: ${error instanceof Error ? error.message: error}`);
        }
        this.client.on("message", (_topic, payload) => this.handleReport(payload));
        this.client.on("error", (error) => {
            this.currentStatus = { state: "error", errors: [error.message] };
            for (const listener of this.statusListener) listener(this.currentStatus);
        });
        this.client.on("close", () => {
            this.connected = false;
            this.currentStatus = { state: "disconnected", errors: ["Connection lost"] };
            for (const listener of this.statusListener) listener(this.currentStatus);
        });
        this.client.on("connect", () => {
            this.connected = true;
            this.requestFullStatus();
            this.syncSlots();
        });
        await this.client.subscribeAsync(this.reportTopic);
        this.connected = true;
        this.requestFullStatus();
        this.syncSlots();
    }

    async disconnect(): Promise<void> {
        await this.client?.endAsync();
        this.client = undefined;
        this.connected = false;
        this.latestReport = {};
        this.activeJob = undefined;
        this.activeFilename = undefined;
        this.finishHandled = false;
        this.currentStatus = { state: "disconnected" };
    }

    isConnected(): boolean { return this.connected; }

    disable(): void { this.isDisabled = true; }

    enable(): void { this.isDisabled = false; }

    async sendJob(job: PrintJob, timelapse?: boolean): Promise<string> {
        if (this.isDisabled) throw new Error(`Bambu printer ${this.config?.name} is disabled`);
        let recordTimelapse = timelapse ?? false;
        if (recordTimelapse && !this.config?.hasCamera) {
            console.warn(`Bambu printer ${this.config?.name} has no camera, skipping timelapse`);
            recordTimelapse = false;
        }
        const filename = `${job.name}.gcode`;
        const gcodeResponse = await fetch(job.gcodeUrl);
        if (!gcodeResponse.ok) throw new Error(`Failed to fetch gcode at ${job.gcodeUrl}: ${gcodeResponse.status}`);
        const buffer = Buffer.from(await gcodeResponse.arrayBuffer());
        await this.uploadFile(buffer, filename, true, recordTimelapse);
        this.finishHandled = false;
        this.activeJob = { ...job, jobid: filename };
        this.activeFilename = filename;
        return filename;
    }

    async cancelJob(_jobId: string): Promise<void> {
        this.publishCommand({ print: { sequence_id: this.nextSequenceId(), command: "stop" } });
    }

    async pauseJob(_jobId: string): Promise<void> {
        this.publishCommand({ print: { sequence_id: this.nextSequenceId(), command: "pause" } });        
    }

    async resumeJob(_jobId: string): Promise<void> {
        this.publishCommand({ print: { sequence_id: this.nextSequenceId(), command: "resume" } });        
    }

    async finishJob(_id: string): Promise<void> {
        const filename = this.activeFilename ?? (this.activeJob ? `${this.activeJob?.name}.gcode`: undefined);
        if (!filename) throw new Error("No active filename found");
        await this.deleteFile(filename);
        this.activeFilename = undefined;
        this.activeJob = undefined;
        this.finishHandled = true;
        this.currentStatus = { ...this.currentStatus, state: "idle" };
        for (const listener of this.statusListener) listener(this.currentStatus);
    }

    async getStatus(fresh?: boolean): Promise<PrinterStatus> {
        if (fresh && this.connected) {
            this.requestFullStatus();
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        return this.currentStatus;
    }

    subscribeToStatus(callback: (status: PrinterStatus) => void): () => void {
        this.statusListener.add(callback);
        if (this.currentStatus) callback(this.currentStatus);
        return () => {
            this.statusListener.delete(callback);
        }; 
    }

    async uploadFile(file: Buffer, filename: string, print?: boolean, timelapse?: boolean): Promise<string> {
        await this.withFtp((client) => client.uploadFrom(Readable.from(file),filename));
        if (print) await this.startPrint(filename, filename.replace(/\.gcode$/, ""), timelapse ?? false);
        return filename;
    }

    async listFiles(): Promise<PrinterFile[]> {
        const files = await this.withFtp((client) => client.list());
        return files
        .filter((f) => f.isFile)
        .map((f) => ({
            filename: f.name,
            size: f.size,
            uploadedAt: f.modifiedAt ?? new Date(),
        }));
    }

    async deleteFile(filename: string): Promise<void> {
        await this.withFtp((client) => client.remove(filename));
    }

    async updateSlot(slotId: number, filamentSlot: FilamentSlot): Promise<void> {
        if (!this.config) throw new Error('Printer config required to change slot');
        const idx = this.config.slots.findIndex((s) => s.slotId === slotId);
        if (idx === -1) return;
        this.config.slots[idx] = filamentSlot;
        this.config.queue = this.config.slots.length === 1 ? this.config.slots[0].filamentType : 'AMS';
        if (this.client?.connected) this.publishSlotSetting({ ...filamentSlot, slotId });
    }

    getConfig(): BambuConfig | null {
        return this.config ?? null;
    }

    private publishCommand(payload: Record<string,unknown>): void {
        if (!this.client?.connected) throw new Error(`Bambu printer ${this.config?.name} is not connected`);
        this.client.publish(this.requestTopic, JSON.stringify(payload));
    }

    private handleReport(raw: Buffer): void {
        let message: BambuReport;
        try {
            message = JSON.parse(raw.toString());
        } catch {
            return;
        }
        if (!message.print) return;
        this.latestReport = { ...this.latestReport, ...message.print };
        this.currentStatus = this.mapStatus(this.latestReport);
        for (const listener of this.statusListener) listener(this.currentStatus);
    }

    private mapStatus(report: BambuPrintReport): PrinterStatus {
        const mapped = report.gcode_state ? (BAMBU_STATE_MAP[report.gcode_state] ?? "error") : "idle";
        const state = this.isDisabled ? "disabled" : mapped === "finished" && this.finishHandled ? "idle" : mapped;
    const hasJob = mapped === "printing" || mapped === "paused" || mapped === "finished";
    return {
      state,
      currentJob:
        hasJob && this.activeJob
          ? {
              printJob: this.activeJob,
              name: report.subtask_name ?? this.activeJob.name,
              progress: report.mc_percent ?? 0,
              timeRemaining: (report.mc_remaining_time ?? 0) * 60, // minutes -> seconds
            }
          : undefined,
      temperature: {
        nozzle: { current: report.nozzle_temper ?? 0, target: report.nozzle_target_temper ?? 0 },
        bed: { current: report.bed_temper ?? 0, target: report.bed_target_temper ?? 0 },
      },
    };
    }

    private requestFullStatus(): void {
        this.publishCommand({ pushing: {sequence_id: this.nextSequenceId(), command: "pushall"} });
    }

    private slotAddress(slotId: number): { ams_id: number; tray_id: number } {
        const count = this.config?.slots?.length ?? 0;
        if (count <= 1) return { ...BAMBU_EXTERNAL_SPOOL };
        return { ams_id: Math.floor(slotId / 4), tray_id: slotId % 4 };
    }

    private publishSlotSetting(slot: FilamentSlot): void {
        const { ams_id, tray_id } = this.slotAddress(slot.slotId);
        this.publishCommand({
            print: {
                sequence_id: this.nextSequenceId(),
                command: "ams_filament_setting",
                ams_id,
                tray_id,
                tray_info_idx: BAMBU_TRAY_INFO_IDX[slot.filamentType],
                tray_type: BAMBU_TRAY_TYPE[slot.filamentType],
                tray_color: BAMBU_TRAY_COLOR[slot.color],
                nozzle_temp_min: slot.nozzleTempMin,
                nozzle_temp_max: slot.nozzleTempMax,
            },
        });
    }

    private syncSlots(): void {
        for (const slot of this.config?.slots ?? []) this.publishSlotSetting(slot);
    }

    private async withFtp<T>(fn: (client: FtpClient) => Promise<T>): Promise<T> {
        if (!this.config) throw new Error('Ftp client requires printer config');
        const ftpclient = new FtpClient();
        try {
            await ftpclient.access({
                host: this.config.ip,
                port: 990,
                user: "bblp",
                password: this.config.password,
                secure: "implicit",
                secureOptions: {rejectUnauthorized: false},
            });
            return await fn(ftpclient);
        } finally {
            ftpclient.close();
        }
    }

    private async startPrint(filename: string, name: string, timelapse: boolean): Promise<void> {
        if (!this.config) throw new Error('Ftp client requires printer config');        
        // One slot => external spool (no AMS); >1 => AMS. See bambu-ams.example.ts.
        const useAms = (this.config.slots?.length ?? 0) > 1;
        this.publishCommand({
        print: {
            sequence_id: this.nextSequenceId(),
            command: "project_file",
            // For a raw .gcode at the SD root, point param/url at the file itself.
            // For a sliced .3mf project, param is usually 'Metadata/plate_1.gcode'.
            param: filename,
            url: `file:///sdcard/${filename}`,
            subtask_name: name,
            use_ams: useAms,
            timelapse,
            bed_leveling: true,
            flow_cali: false,
            vibration_cali: true,
            layer_inspect: false,
        },
        });
    }

}