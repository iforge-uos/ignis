import type { printing } from "@packages/db/interfaces";
import { MaterialSchema } from "@packages/db/zod/modules/printing";
import { Button } from "@packages/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import { Input } from "@packages/ui/components/input";
import { Label } from "@packages/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon, ChevronDown, PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { orpc } from "@/lib/orpc";

export const ANY_COLOUR = "ANY";

export const PAGE_SIZE = 20;

export type Material = printing.Material;

export const MATERIAL_TEMPS: Record<Material, { nozzle_temp_min: number; nozzle_temp_max: number; bed_temp: number }> =
  {
    PLA: { nozzle_temp_min: 190, nozzle_temp_max: 220, bed_temp: 60 },
    PETG: { nozzle_temp_min: 230, nozzle_temp_max: 250, bed_temp: 80 },
    TPU: { nozzle_temp_min: 210, nozzle_temp_max: 230, bed_temp: 40 },
  };

export const SEARCH_DEBOUNCE_MS = 300;

const NOW = new Date();
const FIRST_YEAR = 2025;

export const CURRENT_ACADEMIC_YEAR = NOW.getMonth() >= 8 ? NOW.getFullYear() : NOW.getFullYear() - 1;

export const ACADEMIC_YEARS = Array.from(
  { length: CURRENT_ACADEMIC_YEAR - FIRST_YEAR + 1 },
  (_, i) => CURRENT_ACADEMIC_YEAR - i,
);

export function academicLabel(start_year: number): string {
  return `${start_year}/${String((start_year + 1) % 100).padStart(2, "0")}`;
}

export function academicYearRange(start_year: number): { start_time: string; end_time: string } {
  return {
    start_time: new Date(Date.UTC(start_year, 8, 1)).toISOString(),
    end_time: new Date(Date.UTC(start_year + 1, 8, 1) - 1).toISOString(),
  };
}

export function AcademicYearPicker({ year, onYearChange }: { year: number; onYearChange: (year: number) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-base">
          {academicLabel(year)}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
          {ACADEMIC_YEARS.map((y) => (
            <DropdownMenuRadioItem key={y} value={String(y)}>
              {academicLabel(y)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b py-1.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

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

export type PrintStatusValue = "QUEUED" | "UNDER_REVIEW" | "CANCELLED" | "FAILED";

export const PRINT_STATUS_OPTIONS: { value: PrintStatusValue; label: string }[] = [
  { value: "QUEUED", label: "Queued" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "FAILED", label: "Failed" },
];

export const PRINT_STATUS_VALUES: Record<string, PrintStatusValue> = {
  Queued: "QUEUED",
  UnderReview: "UNDER_REVIEW",
  Cancelled: "CANCELLED",
  Failed: "FAILED",
};

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

export function stateStyle(state: string): string {
  return STATE_STYLES[state] ?? STATE_STYLES.disconnected;
}

export function PrinterStateBadge({ state, className }: { state: string; className?: string }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${stateStyle(state)} ${className ?? ""}`}
    >
      {state}
    </span>
  );
}

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

export type Manufacturer = printing.Manafacturers;
export type Driver = printing.Drivers;

export const MANUFACTURERS: { value: Manufacturer; label: string }[] = [
  { value: "PRUSA", label: "Prusa" },
  { value: "BAMBU", label: "Bambu" },
];

export const DRIVERS: { value: Driver; label: string }[] = [
  { value: "OCTOPRINT", label: "OctoPrint" },
  { value: "PRUSALINK", label: "PrusaLink" },
  { value: "BAMBU", label: "Bambu" },
];

export const DEFAULT_DRIVER: Record<Manufacturer, Driver> = {
  PRUSA: "OCTOPRINT",
  BAMBU: "BAMBU",
};

export const KEY_LABELS: Record<Driver, string[]> = {
  OCTOPRINT: ["API key"],
  PRUSALINK: ["Username", "Password"],
  BAMBU: ["Serial", "Access code"],
};

export function blankKeys(driver: Driver): string[] {
  return KEY_LABELS[driver].map(() => "");
}

export function KeyFields({
  driver,
  keys,
  onChange,
  placeholder,
}: {
  driver: Driver;
  keys: string[];
  onChange: (keys: string[]) => void;
  placeholder?: string;
}) {
  const labels = KEY_LABELS[driver];

  return (
    <div className="grid grid-cols-2 gap-3">
      {labels.map((label, index) => (
        <div key={label} className="flex flex-col gap-2">
          <Label htmlFor={`key_${index}`}>{label}</Label>
          <Input
            id={`key_${index}`}
            type={index === labels.length - 1 ? "password" : "text"}
            placeholder={placeholder}
            value={keys[index] ?? ""}
            onChange={(e) => onChange(labels.map((_, i) => (i === index ? e.target.value : (keys[i] ?? ""))))}
          />
        </div>
      ))}
    </div>
  );
}

export type ScanResult = { name: string; minutes: number; mass: number; materials: Material[] };

function parseTimeToMinutes(raw: string): number {
  const num = (unit: string) => Number(new RegExp(`(\\d+)\\s*${unit}`, "i").exec(raw)?.[1] ?? 0);
  return num("d") * 1440 + num("h") * 60 + num("m") + Math.round(num("s") / 60);
}

export function parseGcode(text: string, filename: string): ScanResult {
  const time_match = text.match(/estimated (?:printing )?time[^\n:=]*[:=]\s*([0-9hmsd \t]+)/i);
  const mass_match =
    text.match(/filament used \[g\][^\n:=]*[:=]\s*([\d.]+)/i) ??
    text.match(/(?:total )?filament (?:used|weight)[^\n:=]*\[g\][^\n:=]*[:=]\s*([\d.]+)/i);
  const type_match = text.match(/filament_type[^\n:=]*[:=]\s*([A-Za-z0-9;, ]+)/i);
  const materials = (type_match?.[1] ?? "")
    .split(/[;,\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s): s is Material => (MaterialSchema.options as readonly string[]).includes(s));

  return {
    name: filename.replace(/\.(gcode|3mf)$/i, ""),
    minutes: time_match ? parseTimeToMinutes(time_match[1]) : 0,
    mass: mass_match ? Math.round(Number(mass_match[1])) : 0,
    materials,
  };
}

export type SlotDraft = {
  id: string;
  material: Material;
  colour: string;
  nozzle_temp_min: number;
  nozzle_temp_max: number;
  bed_temp: number;
};

export function newSlot(material: Material = "PLA"): SlotDraft {
  return { id: crypto.randomUUID(), material, colour: "#000000", ...MATERIAL_TEMPS[material] };
}

export function toColour(colour: string): string {
  return colour === ANY_COLOUR ? ANY_COLOUR : `${colour.replace("#", "").toUpperCase()}FF`;
}

export function fromColour(colour: string): string {
  return colour === ANY_COLOUR ? ANY_COLOUR : hex(colour);
}

export function slotsValid(slots: SlotDraft[]): boolean {
  return slots.length > 0 && slots.every((slot) => slot.nozzle_temp_max > slot.nozzle_temp_min);
}

export function FilamentSlots({
  slots,
  onChange,
  allowAny,
  single,
}: {
  slots: SlotDraft[];
  onChange: (slots: SlotDraft[]) => void;
  allowAny?: boolean;
  single?: boolean;
}) {
  const update = (index: number, slot: Partial<SlotDraft>) =>
    onChange(slots.map((s, i) => (i === index ? { ...s, ...slot } : s)));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{single ? "Filament" : "Filament slots"}</Label>
        {!single && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...slots, newSlot()])}>
            <PlusIcon />
            Add slot
          </Button>
        )}
      </div>

      {slots.map((slot, index) => (
        <div key={slot.id} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Material</span>
            <Select
              value={slot.material}
              onValueChange={(value) =>
                update(index, { material: value as Material, ...MATERIAL_TEMPS[value as Material] })
              }
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MaterialSchema.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Colour</span>
            <div className="flex items-center gap-2">
              {slot.colour === ANY_COLOUR ? (
                <span className="flex h-9 w-16 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                  Any
                </span>
              ) : (
                <Input
                  type="color"
                  className="h-9 w-16 p-1"
                  value={slot.colour}
                  onChange={(e) => update(index, { colour: e.target.value })}
                />
              )}
              {allowAny && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => update(index, { colour: slot.colour === ANY_COLOUR ? "#000000" : ANY_COLOUR })}
                >
                  {slot.colour === ANY_COLOUR ? "Pick" : "Any"}
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Nozzle min</span>
            <Input
              type="number"
              className="w-24"
              value={slot.nozzle_temp_min}
              onChange={(e) => update(index, { nozzle_temp_min: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Nozzle max</span>
            <Input
              type="number"
              className="w-24"
              value={slot.nozzle_temp_max}
              onChange={(e) => update(index, { nozzle_temp_max: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Bed</span>
            <Input
              type="number"
              className="w-20"
              value={slot.bed_temp}
              onChange={(e) => update(index, { bed_temp: Number(e.target.value) })}
            />
          </div>

          {!single && slots.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-600"
              onClick={() => onChange(slots.filter((_, i) => i !== index))}
            >
              <Trash2Icon />
            </Button>
          )}
        </div>
      ))}

      {!slotsValid(slots) && (
        <span className="text-sm text-red-600">Each slot needs a nozzle max above its nozzle min.</span>
      )}
    </div>
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
