import type {
  FilamentSlot,
  PrinterConfig,
  PrinterDriver,
  PrinterFile,
  PrinterStatus,
  PrintJob,
} from "@/lib/printers/types";

export interface PrusaConfig extends PrinterConfig {
  username: string;
  password: string;
}

interface DigestChallenge {
  realm: string;
  nonce: string;
  qop?: string;
  opaque?: string;
  algorithm?: string;
}

// API call responses
type PrusaState = "IDLE" | "BUSY" | "PRINTING" | "PAUSED" | "FINISHED" | "STOPPED" | "ERROR" | "ATTENTION" | "READY";

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

// Convert Prusa reposne state to local state
const PRUSA_STATE_MAP: Record<PrusaState, PrinterStatus["state"]> = {
  IDLE: "idle",
  READY: "idle",
  FINISHED: "finished",
  PRINTING: "printing",
  BUSY: "printing",
  PAUSED: "paused",
  ERROR: "error",
  STOPPED: "error",
  ATTENTION: "error",
};

/*
Main Prusa Driver class structure:
-Private variables
-Key function
-Main export function, based on PrinterDriver
-Private helper function
*/
export class PrusaDriver implements PrinterDriver {
  constructor(config: PrusaConfig) {
    this.config = config;
  }
  // Private variables
  private config?: PrusaConfig;
  private connected = false;
  private isDisabled = false;
  private currentStatus: PrinterStatus = { state: "disconnected" };
  private activeJob?: PrintJob;
  private activeFilename?: string;
  private finishHandled = true; // true once finishJob has cleaned up a FINISHED print, until the next job

  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private statusListener = new Set<(status: PrinterStatus) => void>();
  private digestSession?: { challenge: DigestChallenge; nc: number };

  // Key functions
  private get baseUrl(): string {
    if (!this.config) throw new Error("Prusa printer config not set");
    return `http://${this.config.ip}/api/v1`;
  }

  private digestHash(algorithm: string | undefined, data: string): string {
    const name = algorithm?.toUpperCase().startsWith("SHA-256") ? "sha256" : "md5";
    return new Bun.CryptoHasher(name).update(data).digest("hex");
  }

  private parseDigestChallenge(header: string): DigestChallenge {
    const params: Record<string, string> = {};
    for (const match of header.replace(/^Digest\s+/i, "").matchAll(/(\w+)=(?:"([^"]*)"|([^,]+))/g)) {
      params[match[1].toLowerCase()] = match[2] ?? match[3];
    }
    return {
      realm: params.realm ?? "",
      nonce: params.nonce ?? "",
      qop: params.qop,
      opaque: params.opaque,
      algorithm: params.algorithm,
    };
  }

  private buildAuthHeader(method: string, uri: string, challenge: DigestChallenge, nc: number): string {
    if (!this.config) throw new Error("Prusa printer config not set");
    const { username, password } = this.config;
    const { realm, nonce, qop, opaque, algorithm } = challenge;
    const ha1 = this.digestHash(algorithm, `${username}:${realm}:${password}`);
    const ha2 = this.digestHash(algorithm, `${method}:${uri}`);
    const ncValue = nc.toString(16).padStart(8, "0");
    const cnonce = crypto.randomUUID().replace(/-/g, "");
    const response = qop
      ? this.digestHash(algorithm, `${ha1}:${nonce}:${ncValue}:${cnonce}:${qop}:${ha2}`)
      : this.digestHash(algorithm, `${ha1}:${nonce}:${ha2}`);

    const parts = [
      `username="${username}"`,
      `realm="${realm}"`,
      `nonce="${nonce}"`,
      `uri="${uri}"`,
      `response="${response}"`,
    ];
    if (qop) parts.push(`qop=${qop}`, `nc=${ncValue}`, `cnonce="${cnonce}"`);
    if (opaque) parts.push(`opaque="${opaque}"`);
    if (algorithm) parts.push(`algorithm=${algorithm}`);
    return `Digest ${parts.join(", ")}`;
  }

  private async digestFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const method = (init.method ?? "GET").toUpperCase();
    const { pathname, search } = new URL(url);
    const uri = pathname + search;

    const send = (session: { challenge: DigestChallenge; nc: number }) => {
      session.nc += 1;
      const headers = new Headers(init.headers);
      headers.set("Authorization", this.buildAuthHeader(method, uri, session.challenge, session.nc));
      return fetch(url, { ...init, method, headers });
    };

    if (this.digestSession) {
      const response = await send(this.digestSession);
      if (response.status !== 401) return response;
    }

    const probe = await fetch(url, { method: "GET" });
    const wwwAuth = probe.headers.get("www-authenticate");
    if (probe.status !== 401 || !wwwAuth || !/digest/i.test(wwwAuth)) return probe;
    this.digestSession = { challenge: this.parseDigestChallenge(wwwAuth), nc: 0 };
    return send(this.digestSession);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    if (!this.config) throw new Error("Prusa printer config not set");
    const response = await this.digestFetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) throw new Error(`Prusa API ${method} ${path}: ${response.status} ${response.statusText}`);
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  // Main driver functions
  async connect(): Promise<void> {
    try {
      this.currentStatus = await this.fetchStatus();
    } catch (error) {
      this.connected = false;
      throw new Error(
        `Failed to connect to Prusa printer "${this.config?.name}" at ${this.config?.ip}: ${error instanceof Error ? error.message : error}`,
      );
    }
    this.connected = true;
    this.startPolling();
  }

  async disconnect(): Promise<void> {
    this.stopPolling();
    this.connected = false;
    const disconnected: PrinterStatus = { state: "disconnected" };
    this.currentStatus = disconnected;
  }

  isConnected = (): boolean => this.connected;

  disable(): void {
    this.isDisabled = true;
  }
  enable(): void {
    this.isDisabled = false;
  }

  async sendJob(job: PrintJob, _timelapse?: boolean): Promise<string> {
    if (this.isDisabled) throw new Error(`Prusa printer ${this.config?.name} is disabled`);
    const filename = `${job.name}.gcode`;
    const gcodeResponse = await fetch(job.gcodeUrl);
    if (!gcodeResponse.ok) throw new Error(`Failed to fetch gcode at ${job.gcodeUrl}: ${gcodeResponse.status}`);
    const buffer = Buffer.from(await gcodeResponse.arrayBuffer());
    await this.uploadFile(buffer, filename, true);
    const prusaJob = await this.waitForJob();
    this.finishHandled = false;
    this.activeJob = job;
    this.activeJob.jobid = String(prusaJob.id);
    this.activeFilename = filename;
    return this.activeJob.jobid;
  }

  async cancelJob(jobId: string): Promise<void> {
    await this.request("DELETE", `/job/${jobId}`);
  }

  async pauseJob(jobId: string): Promise<void> {
    await this.request("PUT", `/job/${jobId}/pause`);
  }

  async resumeJob(jobId: string): Promise<void> {
    await this.request("PUT", `/job/${jobId}/resume`);
  }

  async finishJob(_id: string): Promise<void> {
    const filename = this.activeFilename ?? (this.activeJob ? `${this.activeJob.name}.gcode` : undefined);
    if (!filename) throw new Error("No active filename found");
    await this.deleteFile(filename);
    this.activeFilename = undefined;
    this.activeJob = undefined;
    this.finishHandled = true;
    this.currentStatus = { ...this.currentStatus, state: "idle" };
    for (const listener of this.statusListener) listener(this.currentStatus);
  }

  get Config(): PrusaConfig | null {
    return this.config ?? null;
  }

  get ActiveJob(): PrintJob | null {
    return this.activeJob ?? null;
  }

  async getStatus(fresh?: boolean): Promise<PrinterStatus> {
    if (fresh) return this.fetchStatus();
    return this.currentStatus;
  }

  subscribeToStatus(callback: (status: PrinterStatus) => void): () => void {
    this.statusListener.add(callback);
    if (this.currentStatus) callback(this.currentStatus);
    return () => {
      this.statusListener.delete(callback);
    };
  }

  async uploadFile(file: Buffer, filename: string, print?: boolean): Promise<string> {
    if (!this.config) throw new Error("Prusa printer config not set");
    const response = await this.digestFetch(`${this.baseUrl}/files/local/${encodeURIComponent(filename)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(file.length),
        "Print-After-Upload": print ? "?1" : "?0",
        Overwrite: "?1",
      },
      body: file as unknown as BodyInit,
    });

    if (!response.ok)
      throw new Error(`Prusa API PUT /files/local/${filename}: ${response.status} ${response.statusText}`);
    return filename;
  }

  async listFiles(): Promise<PrinterFile[]> {
    const data = await this.request<PrusaFolderResponse>("GET", "/files/local");
    return data.children
      .filter((c) => c.type !== "FOLDER")
      .map((c) => ({
        filename: c.name,
        size: c.size ?? 0,
        uploadedAt: new Date(c.m_timestamp * 1000),
      }));
  }

  async deleteFile(filename: string): Promise<void> {
    await this.request("DELETE", `/files/local/${encodeURIComponent(filename)}`);
  }

  async updateSlot(slotId: number, filamentSlot: FilamentSlot): Promise<void> {
    if (!this.config) throw new Error("Updating a printer filament slot requires a config");
    const idx = this.config.slots.findIndex((s) => s.slotId === slotId);
    if (idx === -1) return;
    this.config.slots[idx] = filamentSlot;
    if (this.config.slots.length === 1) {
      this.config.queue = this.config.slots[0].filamentType;
    }
  }

  async syncSlots(): Promise<FilamentSlot[]> {
    throw new Error("Prusa printers have no AMS to sync");
  }

  // Private helper functions
  private async waitForJob(attempts = 5, delayMs = 500): Promise<PrusaJobResponse> {
    for (let i = 0; i < attempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      const prusaJob = await this.request<PrusaJobResponse>("GET", "/job");
      if (prusaJob) return prusaJob;
    }
    throw new Error(`Job did not start on ${this.config?.name} after upload`);
  }

  private async fetchStatus(): Promise<PrinterStatus> {
    const rawStatus = await this.request<PrusaStatusResponse>("GET", "/status");
    this.currentStatus = this.mapStatus(rawStatus);
    return this.currentStatus;
  }

  private mapStatus(rawStatus: PrusaStatusResponse): PrinterStatus {
    const mapped = PRUSA_STATE_MAP[rawStatus.printer.state] ?? "error";
    const state = this.isDisabled ? "disabled" : mapped === "finished" && this.finishHandled ? "idle" : mapped;
    return {
      state,
      currentJob: rawStatus.job
        ? {
            printJob: {
              jobid: String(rawStatus.job.id),
              uuid: this.activeJob?.uuid ?? "",
              name: this.activeJob?.name ?? "",
              gcodeUrl: this.activeJob?.gcodeUrl ?? "",
              filament: this.config?.slots ?? [],
              queue: this.config?.queue ?? "PLA",
            },
            name: this.activeJob?.name ?? "",
            progress: rawStatus.job.progress,
            timeRemaining: rawStatus.job.time_remaining ?? 0,
          }
        : undefined,
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
        const disconnected: PrinterStatus = { state: "disconnected", errors: ["Connection lost"] };
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
