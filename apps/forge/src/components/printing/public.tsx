import { CameraFeed, STATE_STYLES, formatRemaining } from "@/components/printing/utils";

export function PrinterCard({ printer, status }) {
  const offline = status.state === "disconnected" || status.state === "disabled";
  const job = status.current_job;

  return (
    <>
      <CameraFeed name={printer.name} hasCamera={printer.has_camera} offline={offline} />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-lg font-bold">{printer.name}</div>
          <div className="truncate text-sm text-muted-foreground">
            {printer.manufacturer} - {printer.model} - {printer.location}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
            STATE_STYLES[status.state] ?? STATE_STYLES.disconnected
          }`}
        >
          {status.state}
        </span>
      </div>

      {job && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(job.progress)}%</span>
            <span>{formatRemaining(job.time_remaining)} left</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${job.progress}%` }} />
          </div>
        </div>
      )}

      {status.temperature && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            Nozzle {Math.round(status.temperature.nozzle.current)}°/{Math.round(status.temperature.nozzle.target)}°
          </span>
          <span>
            Bed {Math.round(status.temperature.bed.current)}°/{Math.round(status.temperature.bed.target)}°
          </span>
        </div>
      )}
    </>
  );
}
