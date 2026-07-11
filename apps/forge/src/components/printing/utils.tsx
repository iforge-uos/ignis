import { Button } from "@packages/ui/components/button";
import { Input } from "@packages/ui/components/input";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { orpc } from "@/lib/orpc";

export const ANY_COLOUR = "ANY";

export const PAGE_SIZE = 20;

const SEARCH_DEBOUNCE_MS = 300;

export const PRINT_STATUS_STYLES: Record<string, string> = {
  Complete: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Printing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Queued: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  UnderReview: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Cancelled: "bg-neutral-500/15 text-neutral-500",
  Failed: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function PrintStatusBadge({ state }: { state: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        PRINT_STATUS_STYLES[state] ?? PRINT_STATUS_STYLES.Cancelled
      }`}
    >
      {state === "UnderReview" ? "Under review" : state}
    </span>
  );
}

export function formatFailureReason(reason?: string): string {
  if (!reason) return "—";
  const words = reason.toLowerCase().replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function TableButtons({
  offset,
  count,
  onOffsetChange,
}: {
  offset: number;
  count: number;
  onOffsetChange: (offset: number) => void;
}) {
  if (offset === 0 && count < PAGE_SIZE) return null;
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        disabled={offset === 0}
        onClick={() => onOffsetChange(Math.max(0, offset - PAGE_SIZE))}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={count < PAGE_SIZE}
        onClick={() => onOffsetChange(offset + PAGE_SIZE)}
      >
        Next
      </Button>
    </div>
  );
}

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
  const [img_failed, setImgFailed] = useState(false);
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
          {modelImg && !img_failed && (
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
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatMass(mass: number): string {
  return mass >= 1000 ? `${(mass / 1000).toFixed(1)}kg` : `${Math.round(mass)}g`;
}

export function hex(colour: string): string {
  return `#${colour.slice(0, 6)}`;
}

export function Swatch({ colour, className }: { colour: string; className?: string }) {
  if (colour === ANY_COLOUR) {
    return <span className={`shrink-0 rounded-full border border-dashed bg-muted ${className}`} />;
  }
  return <span className={`shrink-0 rounded-full border ${className}`} style={{ backgroundColor: hex(colour) }} />;
}

export function FilamentChip({ material, colour }: { material: string; colour: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs">
      <Swatch colour={colour} className="size-3" />
      <span className="font-medium">{material}</span>
      <span className="text-muted-foreground">{colour === ANY_COLOUR ? "any colour" : hex(colour)}</span>
    </span>
  );
}

export type SelectedUser = { id: string; display_name: string };

export function UserSearch({
  placeholder,
  requireRep,
  selected,
  onSelect,
}: {
  placeholder: string;
  requireRep?: boolean;
  selected: SelectedUser | null;
  onSelect: (user: SelectedUser | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);
  const { data } = useQuery({
    ...orpc.users.search.queryOptions({ input: { query: debounced, limit: 5 } }),
    enabled: debounced.trim().length > 1,
  });

  const results = (data ?? []).filter(
    (u) => !requireRep || u.roles.some((r) => r.name === "Rep" || r.name === "Admin"),
  );

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-md border bg-green-500/5 px-3 py-2">
        <span className="flex items-center gap-2">
          <CheckIcon className="size-4 text-green-500" />
          {selected.display_name}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(null)}>
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Input placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
      {results.length > 0 && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 flex flex-col overflow-hidden rounded-md border bg-popover shadow-md">
          {results.map((u) => (
            <button
              key={u.id}
              type="button"
              className="flex flex-col items-start px-3 py-2 text-left hover:bg-muted"
              onClick={() => {
                onSelect({ id: u.id, display_name: u.display_name });
                setQuery("");
              }}
            >
              <span className="font-medium">{u.display_name}</span>
              <span className="text-xs text-muted-foreground">@{u.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
