import type {
  Filament,
  PrinterConfig,
  PrinterDriver,
  PrinterFile,
  PrinterStatus,
  PrintJob,
} from "@/lib/printers/types";

export interface OctoprintConfig extends PrinterConfig {
  username: string;
  password: string;
}

interface OctoStateFlags {
  operational: boolean;
  printing: boolean;
  paused: boolean;
  pausing: boolean;
  cancelling: boolean;
  error: boolean;
  ready: boolean;
}

interface OctoPrinterResponse {
  state: {
    text: string;
    flags: OctoStateFlags;
  };
  temperature: {
    tool0?: { actual: number; target: number };
    bed?: { actual: number; target: number };
  };
}

interface OctoJobResponse {
  job: {
    file: { name: string | null };
  };
  progress: {
    completion: number | null;
    printTime: number | null;
    printTimeLeft: number | null;
  };
  state: string;
}

interface OctoFilesResponse {
  files: Array<{
    name: string;
    size?: number;
    date?: number;
    type: string;
  }>;
}

interface OctoTimelapseResponse {
  files: Array<{ name: string; url: string; date?: number }>;
}

const mapOctoState = (flags: OctoStateFlags, hasFinished: boolean): PrinterStatus["state"] => {
  if (flags.error) return "error";
  if (flags.paused || flags.pausing) return "paused";
  if (flags.printing || flags.cancelling) return "printing";
  if (hasFinished) return "finished";
  return "idle";
};

export class OctoprintDriver implements PrinterDriver {
  constructor(config: OctoprintConfig) {
    this.config = config;
  }

  private config?: OctoprintConfig;
  private connected = false;
  private is_disabled = false;
  private current_status: PrinterStatus = { state: "disconnected" };
  private active_job?: PrintJob;
  private active_filename?: string;
  private finish_handled = true;
  private timelapse_enabled = false;

  private poll_interval: ReturnType<typeof setInterval> | null = null;
  private status_listener = new Set<(status: PrinterStatus) => void>();

  private get baseUrl(): string {
    if (!this.config) throw new Error("Octoprint printer config not set");
    return `http://${this.config.ip}/api`;
  }

  private get apiKey(): string {
    if (!this.config) throw new Error("Octoprint printer config not set");
    return this.config.password;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "X-Api-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) throw new Error(`Octoprint API ${method} ${path}: ${response.status} ${response.statusText}`);
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  async connect(): Promise<void> {
    try {
      this.current_status = await this.fetchStatus();
    } catch (error) {
      this.connected = false;
      throw new Error(
        `Failed to connect to Octoprint printer "${this.config?.name}" at ${this.config?.ip}: ${error instanceof Error ? error.message : error}`,
      );
    }
    this.connected = true;
    this.startPolling();
  }

  async disconnect(): Promise<void> {
    this.stopPolling();
    this.connected = false;
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
    if (this.is_disabled) throw new Error(`Octoprint printer ${this.config?.name} is disabled`);
    const filename = `${job.name}.gcode`;
    const gcodeResponse = await fetch(job.gcode_url);
    if (!gcodeResponse.ok) throw new Error(`Failed to fetch gcode at ${job.gcode_url}: ${gcodeResponse.status}`);
    const buffer = Buffer.from(await gcodeResponse.arrayBuffer());
    await this.setTimelapse(timelapse ?? false);
    await this.uploadFile(buffer, filename, true);
    await this.waitForJob(filename);
    this.finish_handled = false;
    this.active_job = { ...job, job_id: filename };
    this.active_filename = filename;
    return filename;
  }

  async cancelJob(_job_id: string): Promise<void> {
    await this.request("POST", "/job", { command: "cancel" });
  }

  async pauseJob(_job_id: string): Promise<void> {
    await this.request("POST", "/job", { command: "pause", action: "pause" });
  }

  async resumeJob(_job_id: string): Promise<void> {
    await this.request("POST", "/job", { command: "pause", action: "resume" });
  }

  async finishJob(_id: string): Promise<void> {
    const filename = this.active_filename ?? (this.active_job ? `${this.active_job.name}.gcode` : undefined);
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

  get Config(): OctoprintConfig | null {
    return this.config ?? null;
  }

  get ActiveJob(): PrintJob | null {
    return this.active_job ?? null;
  }

  async getStatus(fresh?: boolean): Promise<PrinterStatus> {
    if (fresh) return this.fetchStatus();
    return this.current_status;
  }

  subscribeToStatus(callback: (status: PrinterStatus) => void): () => void {
    this.status_listener.add(callback);
    if (this.current_status) callback(this.current_status);
    return () => {
      this.status_listener.delete(callback);
    };
  }

  async uploadFile(file: Buffer, filename: string, print?: boolean): Promise<string> {
    const form = new FormData();
    form.append("file", new Blob([file as unknown as BlobPart]), filename);
    form.append("print", print ? "true" : "false");

    const response = await fetch(`${this.baseUrl}/files/local`, {
      method: "POST",
      headers: { "X-Api-Key": this.apiKey },
      body: form,
    });

    if (!response.ok)
      throw new Error(`Octoprint API POST /files/local ${filename}: ${response.status} ${response.statusText}`);
    return filename;
  }

  async listFiles(): Promise<PrinterFile[]> {
    const data = await this.request<OctoFilesResponse>("GET", "/files/local");
    return data.files
      .filter((f) => f.type !== "folder")
      .map((f) => ({
        filename: f.name,
        size: f.size ?? 0,
        uploaded_at: new Date((f.date ?? 0) * 1000),
      }));
  }

  async deleteFile(filename: string): Promise<void> {
    await this.request("DELETE", `/files/local/${encodeURIComponent(filename)}`);
  }

  async updateSlot(slotId: number, filament: Filament): Promise<void> {
    if (!this.config) throw new Error("Updating a printer filament slot requires a config");
    const idx = this.config.filament.findIndex((s) => s.slot_id === slotId);
    if (idx === -1) return;
    this.config.filament[idx] = filament;
    if (this.config.filament.length === 1) {
      this.config.queue = this.config.filament[0].material;
    }
  }

  async syncSlots(): Promise<Filament[]> {
    throw new Error("Octoprint printers have no AMS to sync");
  }

  private async setTimelapse(enabled: boolean): Promise<void> {
    this.timelapse_enabled = enabled;
    await this.request("POST", "/timelapse", { type: enabled ? "zchange" : "off" });
  }

  async retrieveTimelapse(printName: string, attempts = 30, delayMs = 2000): Promise<Buffer | null> {
    if (!(this.timelapse_enabled && this.config)) return null;
    for (let i = 0; i < attempts; i++) {
      const list = await this.request<OctoTimelapseResponse>("GET", "/timelapse");
      const match = list.files
        .filter((f) => f.name.startsWith(printName))
        .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))[0];
      if (match) {
        const res = await fetch(`http://${this.config.ip}${match.url}`, { headers: { "X-Api-Key": this.apiKey } });
        if (res.ok) {
          this.timelapse_enabled = false;
          return Buffer.from(await res.arrayBuffer());
        }
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return null;
  }

  private async waitForJob(filename: string, attempts = 5, delayMs = 500): Promise<void> {
    for (let i = 0; i < attempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      const job = await this.request<OctoJobResponse>("GET", "/job");
      if (job?.state.toLowerCase().includes("printing") || job?.job.file.name === filename) return;
    }
    throw new Error(`Job did not start on ${this.config?.name} after upload`);
  }

  private async fetchStatus(): Promise<PrinterStatus> {
    const [printer, job] = await Promise.all([
      this.request<OctoPrinterResponse>("GET", "/printer"),
      this.request<OctoJobResponse>("GET", "/job"),
    ]);
    this.current_status = this.mapStatus(printer, job);
    return this.current_status;
  }

  private mapStatus(printer: OctoPrinterResponse, job: OctoJobResponse): PrinterStatus {
    const flags = printer.state.flags;
    const completion = job.progress.completion ?? 0;
    const finished = !!this.active_job && !flags.printing && !flags.paused && completion >= 100;
    const mapped = mapOctoState(flags, finished);
    const state = this.is_disabled ? "disabled" : mapped === "finished" && this.finish_handled ? "idle" : mapped;

    return {
      state,
      current_job: job.job.file.name
        ? {
            print_job: {
              job_id: this.active_filename ?? job.job.file.name,
              uuid: this.active_job?.uuid ?? "",
              name: this.active_job?.name ?? "",
              gcode_url: this.active_job?.gcode_url ?? "",
              filament: this.config?.filament ?? [],
              queue: this.config?.queue ?? "PLA",
            },
            name: this.active_job?.name ?? "",
            progress: completion,
            time_remaining: job.progress.printTimeLeft ?? 0,
          }
        : undefined,
      temperature: {
        nozzle: {
          current: printer.temperature.tool0?.actual ?? 0,
          target: printer.temperature.tool0?.target ?? 0,
        },
        bed: {
          current: printer.temperature.bed?.actual ?? 0,
          target: printer.temperature.bed?.target ?? 0,
        },
      },
    };
  }

  private startPolling(): void {
    this.poll_interval = setInterval(async () => {
      try {
        const status = await this.fetchStatus();
        for (const listener of this.status_listener) listener(status);
      } catch {
        const disconnected: PrinterStatus = { state: "disconnected", errors: ["Connection lost"] };
        this.current_status = disconnected;
        for (const listener of this.status_listener) listener(disconnected);
      }
    }, 5000);
  }

  private stopPolling(): void {
    if (this.poll_interval) {
      clearInterval(this.poll_interval);
      this.poll_interval = null;
    }
  }
}
