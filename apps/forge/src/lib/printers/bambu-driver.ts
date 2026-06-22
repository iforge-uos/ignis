import { Readable } from "node:stream";
import type { printing } from "@packages/db/interfaces";
import { Client as FtpClient } from "basic-ftp";
import mqtt, { type MqttClient } from "mqtt";
import type {
  Filament,
  PrinterConfig,
  PrinterDriver,
  PrinterFile,
  PrinterStatus,
  PrintJob,
} from "@/lib/printers/types";

export interface BambuConfig extends PrinterConfig {
  serial: string;
  password: string;
}

// BAMBU MQTT topics and record keys
type BambuState = "IDLE" | "PREPARE" | "RUNNING" | "PAUSE" | "FINISH" | "FAILED";

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

export const BAMBU_TRAY_TYPE: Record<printing.Material, string> = {
  PLA: "PLA",
  TPU: "TPU",
  PETG: "PETG",
};

const BAMBU_TRAY_TYPE_TO_MATERIAL: Record<string, printing.Material> = Object.fromEntries(
  Object.entries(BAMBU_TRAY_TYPE).map(([material, tray]) => [tray, material as printing.Material]),
);

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

const BAMBU_STATE_MAP: Record<BambuState, PrinterStatus["state"]> = {
  IDLE: "idle",
  FINISH: "finished",
  PREPARE: "printing",
  RUNNING: "printing",
  PAUSE: "paused",
  FAILED: "error",
};

/*
Main BAMBU Driver class structure:
-Private variables
-Key function
-Main export function, based on PrinterDriver
-Private helper function
*/
export class BambuDriver implements PrinterDriver {
  constructor(config: BambuConfig) {
    this.config = config;
  }
  // Private variables
  private config?: BambuConfig;
  private client?: MqttClient;
  private connected = false;
  private is_disabled = false;
  private current_status: PrinterStatus = { state: "disconnected" };
  private active_job?: PrintJob;
  private active_filename?: string;
  private finish_handled = true;
  private latest_report: BambuPrintReport = {};
  private sequence_id = 0;
  private status_listener = new Set<(status: PrinterStatus) => void>();

  // Key functions - MQTT/BAMBU command handeling, see docs
  private get reportTopic(): string {
    return `device/${this.config?.serial}/report`;
  }

  private get requestTopic(): string {
    return `device/${this.config?.serial}/request`;
  }

  private nextSequenceId(): string {
    return String(this.sequence_id++);
  }

  // Main driver functions
  async connect(): Promise<void> {
    if (!this.config) throw new Error("Config required when connecting a printer");
    try {
      this.client = await mqtt.connectAsync(`mqtts://${this.config.ip}:8883`, {
        username: "bblp",
        password: this.config.password,
        rejectUnauthorized: false,
        reconnectPeriod: 5000,
      });
    } catch (error) {
      this.connected = false;
      throw new Error(
        `Failed to connect to Bambu printer "${this.config.name}" at ${this.config.ip}: ${error instanceof Error ? error.message : error}`,
      );
    }
    this.client.on("message", (_topic, payload) => this.handleReport(payload));
    this.client.on("error", (error) => {
      this.current_status = { state: "error", errors: [error.message] };
      for (const listener of this.status_listener) listener(this.current_status);
    });
    this.client.on("close", () => {
      this.connected = false;
      this.current_status = { state: "disconnected", errors: ["Connection lost"] };
      for (const listener of this.status_listener) listener(this.current_status);
    });
    this.client.on("connect", () => {
      this.connected = true;
      this.requestFullStatus();
    });
    await this.client.subscribeAsync(this.reportTopic);
    this.connected = true;
    this.requestFullStatus();
  }

  async disconnect(): Promise<void> {
    await this.client?.endAsync();
    this.client = undefined;
    this.connected = false;
    this.latest_report = {};
    this.active_job = undefined;
    this.active_filename = undefined;
    this.finish_handled = true;
    this.current_status = { state: "disconnected" };
  }

  isConnected = (): boolean => this.connected;

  disable(): void {
    this.is_disabled = true;
  }

  enable(): void {
    this.is_disabled = false;
  }

  async sendJob(job: PrintJob, timelapse?: boolean): Promise<string> {
    if (this.is_disabled) throw new Error(`Bambu printer ${this.config?.name} is disabled`);
    let record_timelapse = timelapse ?? false;
    if (record_timelapse && !this.config?.has_camera) {
      console.warn(`Bambu printer ${this.config?.name} has no camera, skipping timelapse`);
      record_timelapse = false;
    }
    // Later implement
    timelapse = false;
    const filename = `${job.name}.gcode`;
    const gcodeResponse = await fetch(job.gcode_url);
    if (!gcodeResponse.ok) throw new Error(`Failed to fetch gcode at ${job.gcode_url}: ${gcodeResponse.status}`);
    const buffer = Buffer.from(await gcodeResponse.arrayBuffer());
    await this.uploadFile(buffer, filename, true, record_timelapse);
    this.finish_handled = false;
    this.active_job = { ...job, job_id: filename };
    this.active_filename = filename;
    return filename;
  }

  async cancelJob(_job_id: string): Promise<void> {
    this.publishCommand({ print: { sequence_id: this.nextSequenceId(), command: "stop" } });
  }

  async pauseJob(_job_id: string): Promise<void> {
    this.publishCommand({ print: { sequence_id: this.nextSequenceId(), command: "pause" } });
  }

  async resumeJob(_job_id: string): Promise<void> {
    this.publishCommand({ print: { sequence_id: this.nextSequenceId(), command: "resume" } });
  }

  async finishJob(_id: string): Promise<void> {
    const filename = this.active_filename ?? (this.active_job ? `${this.active_job?.name}.gcode` : undefined);
    if (!filename) throw new Error("No active filename found");
    await this.deleteFile(filename);
    this.active_filename = undefined;
    this.active_job = undefined;
    this.finish_handled = true;
    this.current_status = { ...this.current_status, state: "idle" };
    for (const listener of this.status_listener) listener(this.current_status);
  }

  restoreJob(job: PrintJob): void {
    this.active_job = { ...job, job_id: `${job.name}.gcode` };
    this.active_filename = `${job.name}.gcode`;
    this.finish_handled = false;
  }

  get Config(): BambuConfig | null {
    return this.config ?? null;
  }

  get ActiveJob(): PrintJob | null {
    return this.active_job ?? null;
  }

  async getStatus(fresh?: boolean): Promise<PrinterStatus> {
    if (fresh && this.connected) {
      this.requestFullStatus();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return this.current_status;
  }

  subscribeToStatus(callback: (status: PrinterStatus) => void): () => void {
    this.status_listener.add(callback);
    if (this.current_status) callback(this.current_status);
    return () => {
      this.status_listener.delete(callback);
    };
  }

  async uploadFile(file: Buffer, filename: string, print?: boolean, timelapse?: boolean): Promise<string> {
    await this.withFtp((client) => client.uploadFrom(Readable.from(file), filename));
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
        uploaded_at: f.modifiedAt ?? new Date(),
      }));
  }

  async deleteFile(filename: string): Promise<void> {
    await this.withFtp((client) => client.remove(filename));
  }

  async updateSlot(slotId: number, filament: Filament): Promise<void> {
    if (!this.config) throw new Error("Printer config required to change slot");
    if (this.config.queue === "MULTI")
      throw new Error("Multi filament printers requires filament to be editited on printer");
    const idx = this.config.filament.findIndex((s) => s.slot_id === slotId);
    if (idx === -1) return;
    this.config.filament[idx] = filament;
    this.config.queue = this.config.filament.length === 1 ? this.config.filament[0].material : "MULTI";
  }

  async syncSlots(): Promise<Filament[]> {
    if (!this.config) throw new Error("Printer config required to change slot");
    if (this.config.queue !== "MULTI")
      throw new Error("syncSlots is only for AMS printers; the external spool is set with updateSlot");
    if (this.client?.connected) {
      this.requestFullStatus();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    const slots: Filament[] = [];
    for (const unit of this.latest_report.ams?.ams ?? []) {
      for (const tray of unit.tray ?? []) {
        if (!tray.tray_type) continue;
        const filamentType = BAMBU_TRAY_TYPE_TO_MATERIAL[tray.tray_type];
        if (filamentType === undefined) continue;
        const colour = (tray.tray_color ?? "").toUpperCase();
        const nozzle_temp_min = Number(tray.nozzle_temp_min ?? 0);
        const nozzle_temp_max = Number(tray.nozzle_temp_max ?? 0);
        const bed_temp = Number(tray.bed_temp ?? 0);
        if (colour.length !== 8 || nozzle_temp_min <= 0 || nozzle_temp_max <= 0 || bed_temp <= 0) continue;
        slots.push({
          slot_id: Number(unit.id) * 4 + Number(tray.id),
          material: filamentType,
          colour,
          nozzle_temp_min,
          nozzle_temp_max,
          bed_temp,
        });
      }
    }
    this.config.filament = slots.sort((a, b) => a.slot_id - b.slot_id);
    return this.config.filament;
  }

  // Private helper functions
  private publishCommand(payload: Record<string, unknown>): void {
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
    this.latest_report = { ...this.latest_report, ...message.print };
    this.current_status = this.mapStatus(this.latest_report);
    for (const listener of this.status_listener) listener(this.current_status);
  }

  private mapStatus(report: BambuPrintReport): PrinterStatus {
    const mapped = report.gcode_state ? (BAMBU_STATE_MAP[report.gcode_state] ?? "error") : "idle";
    const state = this.is_disabled ? "disabled" : mapped === "finished" && this.finish_handled ? "idle" : mapped;
    const has_job = mapped === "printing" || mapped === "paused" || mapped === "finished";
    return {
      state,
      current_job:
        has_job && this.active_job
          ? {
              print_job: this.active_job,
              name: report.subtask_name ?? this.active_job.name,
              progress: report.mc_percent ?? 0,
              time_remaining: (report.mc_remaining_time ?? 0) * 60, // minutes -> seconds
            }
          : undefined,
      temperature: {
        nozzle: { current: report.nozzle_temper ?? 0, target: report.nozzle_target_temper ?? 0 },
        bed: { current: report.bed_temper ?? 0, target: report.bed_target_temper ?? 0 },
      },
    };
  }

  private requestFullStatus(): void {
    this.publishCommand({ pushing: { sequence_id: this.nextSequenceId(), command: "pushall" } });
  }

  private async withFtp<T>(fn: (client: FtpClient) => Promise<T>): Promise<T> {
    if (!this.config) throw new Error("Ftp client requires printer config");
    const ftpclient = new FtpClient();
    try {
      await ftpclient.access({
        host: this.config.ip,
        port: 990,
        user: "bblp",
        password: this.config.password,
        secure: "implicit",
        secureOptions: { rejectUnauthorized: false },
      });
      return await fn(ftpclient);
    } finally {
      ftpclient.close();
    }
  }

  private async startPrint(filename: string, name: string, timelapse: boolean = false): Promise<void> {
    // Change this to start a print, allways no as retrieval no setup
    timelapse = false;

    if (!this.config) throw new Error("Ftp client requires printer config");
    this.publishCommand({
      print: {
        sequence_id: this.nextSequenceId(),
        command: "project_file",
        param: filename,
        url: `file:///sdcard/${filename}`,
        subtask_name: name,
        use_ams: this.config.queue === "MULTI",
        timelapse,
        bed_leveling: true,
        flow_cali: false,
        vibration_cali: true,
        layer_inspect: false,
      },
    });
  }
}
