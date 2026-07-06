import { useState } from "react";

export const STATE_STYLES: Record<string, string> = {
  idle: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  printing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  paused: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  finished: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  disconnected: "bg-neutral-500/15 text-neutral-500",
  disabled: "bg-neutral-500/15 text-neutral-500",
  error: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function CameraFeed({ name, hasCamera, offline }: { name: string; hasCamera: boolean; offline: boolean }) {
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

export function formatRemaining(seconds: number): string {
  if (seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
