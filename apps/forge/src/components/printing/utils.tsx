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

const MODEL_IMG_ALT: Record<string, string> = {
  H2D: "/printing/bambu-h2d.png",
  "CORE ONE": "/printing/prusa-core-one.png",
  MK4: "/machines/3d-printer.png",
};

function modelImage(model: string) {
  const normalized = model.toUpperCase().replace(/[\s_-]+/g, "");
  for (const key in MODEL_IMG_ALT) {
    if (normalized.includes(key.replace(/[\s_-]+/g, ""))) return MODEL_IMG_ALT[key];
  }
  return undefined;
}

export function CameraFeed({
  name,
  hasCamera,
  model,
  offline,
}: {
  name: string;
  hasCamera: boolean;
  model: string;
  offline: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const show = hasCamera && !offline && !failed;
  const modelImg = modelImage(model);
  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-neutral-900">
      {show ? (
        <img
          src={`/api/camera/${encodeURIComponent(name)}`}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          {modelImg && !imgFailed && (
            <img
              src={modelImg}
              alt={model}
              className="absolute inset-0 h-full w-full object-contain p-6 opacity-30"
              onError={() => setImgFailed(true)}
            />
          )}
          <span className="relative text-sm font-medium text-neutral-200 drop-shadow">
            {!hasCamera ? "No camera" : offline ? "Offline" : "Camera unavailable"}
          </span>
        </>
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
