import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Hammer } from "@/components/loading";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/_authenticated/printing/public/dashboard")({
  component: RouteComponent,
});

const STATE_STYLES: Record<string, string> = {
  idle: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  printing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  paused: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  finished: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  disconnected: "bg-neutral-500/15 text-neutral-500",
  disabled: "bg-neutral-500/15 text-neutral-500",
  error: "bg-red-500/15 text-red-600 dark:text-red-400",
};

function formatRemaining(seconds: number): string {
  if (seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function CameraFeed({ name, hasCamera, offline }: { name: string; hasCamera: boolean; offline: boolean }) {
  const [failed, setFailed] = useState(false);
  const show = hasCamera && !offline && !failed;
  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-neutral-900">
      {show ? (
        <img
          src={`/api/camera/${encodeURIComponent(name)}`}
          alt={`${name} camera`}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-sm text-neutral-400">
          {!hasCamera ? "No camera" : offline ? "Offline" : "Camera unavailable"}
        </span>
      )}
    </div>
  );
}

function RouteComponent() {
  const { data: printers, isPending, error } = useQuery(orpc.print.public.printers.queryOptions());

  if (isPending)
    return (
      <div className="flex justify-center p-6">
        <Hammer />
      </div>
    );
  if (error) return <div className="p-6">Failed to load printers: {error.message}</div>;

  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {printers.map(({ printer, status }) => {
        const offline = status.state === "disconnected" || status.state === "disabled";
        const job = status.current_job;
        return (
          <Link
            key={printer.id}
            to="/printing/public/printer/$name"
            params={{ name: printer.name }}
            className="group flex flex-col gap-3 rounded-xl border p-4 transition hover:border-primary hover:shadow-md"
          >
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
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            )}

            {status.temperature && (
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>
                  Nozzle {Math.round(status.temperature.nozzle.current)}°/
                  {Math.round(status.temperature.nozzle.target)}°
                </span>
                <span>
                  Bed {Math.round(status.temperature.bed.current)}°/{Math.round(status.temperature.bed.target)}°
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
