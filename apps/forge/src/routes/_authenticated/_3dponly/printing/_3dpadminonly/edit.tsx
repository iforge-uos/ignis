import { Temporal } from "@js-temporal/polyfill";
import { PrioritySchema, print_status_FailureReasonSchema } from "@packages/db/zod/modules/printing";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import type { LocationName } from "@packages/types/sign_in";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardHeader } from "@packages/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@packages/ui/components/dialog";
import { Input } from "@packages/ui/components/input";
import { Label } from "@packages/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { Switch } from "@packages/ui/components/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FilePenIcon, PencilIcon, PrinterIcon, RefreshCwIcon, ScrollTextIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type * as z from "zod";
import { Hammer } from "@/components/loading";
import {
  blankKeys,
  DRIVERS,
  type Driver,
  FilamentSlots,
  formatFailureReason,
  formatRemaining,
  fromColour,
  KEY_LABELS,
  KeyFields,
  PRINT_STATUS_OPTIONS,
  PRINT_STATUS_VALUES,
  PrintStatusBadge,
  type PrintStatusValue,
  parseGcode,
  type ScanResult,
  SEARCH_DEBOUNCE_MS,
  type SlotDraft,
  Swatch,
  slotsValid,
  TableButtons,
  toColour,
} from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/_authenticated/_3dponly/printing/_3dpadminonly/edit")({
  component: RouteComponent,
});

type Priority = z.infer<typeof PrioritySchema>;
type FailureReason = z.infer<typeof print_status_FailureReasonSchema>;

type View = "PRINTS" | "PRINTERS";

type FilamentSlot = {
  slot_id: number;
  material: string;
  colour: string;
  nozzle_temp_min: number;
  nozzle_temp_max: number;
  bed_temp: number;
};

type QueuedPrint = {
  id: string;
  name: string;
  mass: number;
  duration: Temporal.Duration;
  priority: Priority;
  filament: FilamentSlot[];
};

type PrinterRow = {
  id: string;
  name: string;
  model: string;
  driver: Driver;
  location: LocationName;
  has_camera: boolean;
  filament: FilamentSlot[];
};

function toDrafts(filament: FilamentSlot[]): SlotDraft[] {
  return filament.map((slot) => ({
    id: crypto.randomUUID(),
    material: slot.material as SlotDraft["material"],
    colour: fromColour(slot.colour),
    nozzle_temp_min: slot.nozzle_temp_min,
    nozzle_temp_max: slot.nozzle_temp_max,
    bed_temp: slot.bed_temp,
  }));
}

function EditPrintDialog({ print, state, onDone }: { print: QueuedPrint; state: string; onDone: () => void }) {
  const current_status = PRINT_STATUS_VALUES[state] ?? "QUEUED";

  const [open, setOpen] = useState(false);
  const [priority, setPriority] = useState<Priority>(print.priority);
  const [status, setStatus] = useState<PrintStatusValue>(current_status);
  const [failure_reason, setFailureReason] = useState<FailureReason | null>(null);
  const [note, setNote] = useState("");
  const [slots, setSlots] = useState<SlotDraft[]>(toDrafts(print.filament));
  const [gcode, setGcode] = useState<File | null>(null);
  const [threemf, setThreemf] = useState<File | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);

  const update = useMutation(orpc.print.queue.update.mutationOptions());
  const setStatusMutation = useMutation(orpc.print.queue.status.mutationOptions());

  const onGcode = async (file: File | null) => {
    setGcode(file);
    setScan(file ? parseGcode(await file.text(), file.name) : null);
  };

  const replacing = gcode !== null || threemf !== null;
  const files_paired = (gcode === null) === (threemf === null);
  const scan_readable = !replacing || (scan !== null && scan.mass > 0 && scan.minutes > 0);
  const status_changed = status !== current_status;
  const needs_reason = status === "FAILED" && failure_reason === null;
  const pending = update.isPending || setStatusMutation.isPending;
  const can_submit = slotsValid(slots) && files_paired && scan_readable && !needs_reason && !pending;

  const error = update.error ?? setStatusMutation.error;

  const onSave = async () => {
    try {
      await update.mutateAsync({
        id: print.id,
        updates: {
          priority,
          filament: slots.map(({ id: _id, ...slot }) => ({ ...slot, colour: toColour(slot.colour) })),
          ...(gcode && threemf && scan
            ? {
                gcode,
                threemf,
                mass: scan.mass,
                duration: Temporal.Duration.from({ minutes: scan.minutes }).toString(),
              }
            : {}),
        },
      });

      if (status_changed) {
        await setStatusMutation.mutateAsync({
          id: print.id,
          status,
          ...(status === "FAILED" ? { reason: failure_reason ?? undefined, message: note.trim() || undefined } : {}),
        });
      }
    } catch {
      return;
    }

    setOpen(false);
    onDone();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setPriority(print.priority);
          setStatus(current_status);
          setFailureReason(null);
          setNote("");
          setSlots(toDrafts(print.filament));
          setGcode(null);
          setThreemf(null);
          setScan(null);
        } else {
          update.reset();
          setStatusMutation.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PencilIcon />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="truncate">Edit {print.name}</DialogTitle>
          <DialogDescription>
            Mass and duration come from the gcode, so they only change when the files are replaced. Replacing the files
            resets the attempt count, and a print that has already started cannot be edited.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PrioritySchema.options.map((option) => (
                    <SelectItem key={option} value={option} className="capitalize">
                      {option.toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as PrintStatusValue)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRINT_STATUS_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>From the gcode</Label>
              <div className="flex h-9 items-center gap-3 text-sm">
                <span className={scan ? "text-muted-foreground line-through" : ""}>
                  {print.mass}g · {formatRemaining(print.duration.total({ unit: "seconds" }))}
                </span>
                {scan && scan.mass > 0 && scan.minutes > 0 && (
                  <span className="font-medium">
                    {scan.mass}g · {formatRemaining(scan.minutes * 60)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {status === "FAILED" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="failure_reason">Failure reason</Label>
                <Select
                  value={failure_reason ?? ""}
                  onValueChange={(value) => setFailureReason(value as FailureReason)}
                >
                  <SelectTrigger id="failure_reason" className="w-full">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {print_status_FailureReasonSchema.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {formatFailureReason(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="note">Note</Label>
                <Input
                  id="note"
                  placeholder="Optional note about the failure"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          )}

          {status_changed && status !== "QUEUED" && status !== "UNDER_REVIEW" && (
            <p className="text-sm text-muted-foreground">
              Marking the print {status.toLowerCase().replace("_", " ")} takes it out of the queue, so it will no longer
              appear here.
            </p>
          )}

          <FilamentSlots slots={slots} onChange={setSlots} allowAny />

          <div className="flex flex-col gap-2">
            <Label>Replace files</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">gcode</span>
                <Input type="file" accept=".gcode" onChange={(e) => onGcode(e.target.files?.[0] ?? null)} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">3mf</span>
                <Input type="file" accept=".3mf" onChange={(e) => setThreemf(e.target.files?.[0] ?? null)} />
              </div>
            </div>
            {!files_paired && <span className="text-sm text-red-600">Replace both files or neither.</span>}
            {files_paired && replacing && !scan_readable && (
              <span className="text-sm text-red-600">
                Could not read the mass and print time from that gcode. Check it was sliced by PrusaSlicer or Bambu
                Studio.
              </span>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error.message}</p>}
        </div>

        <DialogFooter>
          <Button disabled={!can_submit} onClick={onSave}>
            <PencilIcon />
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditPrinterDialog({ printer, onDone }: { printer: PrinterRow; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(printer.name);
  const [model, setModel] = useState(printer.model);
  const [driver, setDriver] = useState<Driver>(printer.driver);
  const [location, setLocation] = useState<LocationName>(printer.location);
  const [has_camera, setHasCamera] = useState(printer.has_camera);
  const [ip, setIp] = useState("");
  const [keys, setKeys] = useState<string[]>(blankKeys(printer.driver));

  const edit = useMutation(
    orpc.print.name.update.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        onDone();
      },
    }),
  );

  const changeDriver = (next: Driver) => {
    setDriver(next);
    setKeys(blankKeys(next));
  };

  const filled = keys.filter((key) => key.trim() !== "").length;
  const all_keys = filled === KEY_LABELS[driver].length;
  const some_keys = filled > 0 && !all_keys;

  const driver_changed = driver !== printer.driver;

  const updates = {
    ...(name.trim() !== printer.name ? { name: name.trim() } : {}),
    ...(model.trim() !== printer.model ? { model: model.trim() } : {}),
    ...(driver_changed ? { driver } : {}),
    ...(location !== printer.location ? { location } : {}),
    ...(has_camera !== printer.has_camera ? { has_camera } : {}),
    ...(ip.trim() !== "" ? { ip: ip.trim() } : {}),
    ...(all_keys ? { keys: keys.map((key) => key.trim()) } : {}),
  };

  const changed = Object.keys(updates).length > 0;
  const reconnects =
    "name" in updates || "ip" in updates || "keys" in updates || "driver" in updates || "has_camera" in updates;
  const keys_required = driver_changed && !all_keys;
  const can_submit =
    changed && !some_keys && !keys_required && name.trim() !== "" && model.trim() !== "" && !edit.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setName(printer.name);
          setModel(printer.model);
          setDriver(printer.driver);
          setLocation(printer.location);
          setHasCamera(printer.has_camera);
          setIp("");
          setKeys(blankKeys(printer.driver));
        } else {
          edit.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PencilIcon />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="capitalize">Edit {printer.name.toLowerCase()}</DialogTitle>
          <DialogDescription>
            The IP and credentials are never sent to the browser, so leave them empty to keep the current values.
            Changing the name, IP, credentials, driver or camera reconnects the printer, which is refused while it is
            mid-print.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="printer_name">Name</Label>
              <Input id="printer_name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="printer_model">Model</Label>
              <Input id="printer_model" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="printer_location">Location</Label>
              <Select value={location} onValueChange={(value) => setLocation(value as LocationName)}>
                <SelectTrigger id="printer_location" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LocationNameSchema.options.map((option) => (
                    <SelectItem key={option} value={option} className="capitalize">
                      {option.toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="printer_ip">IP address</Label>
              <Input id="printer_ip" placeholder="Unchanged" value={ip} onChange={(e) => setIp(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="printer_driver">Driver</Label>
              <Select value={driver} onValueChange={(value) => changeDriver(value as Driver)}>
                <SelectTrigger id="printer_driver" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DRIVERS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <KeyFields
            driver={driver}
            keys={keys}
            onChange={setKeys}
            placeholder={driver_changed ? undefined : "Unchanged"}
          />
          {some_keys && (
            <span className="text-sm text-red-600">
              Fill in every credential for this driver, or leave them all empty.
            </span>
          )}
          {keys_required && (
            <span className="text-sm text-red-600">
              The stored credentials belong to the old driver, so new ones are needed.
            </span>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="printer_camera">Has a camera</Label>
            <Switch id="printer_camera" checked={has_camera} onCheckedChange={setHasCamera} />
          </div>

          {reconnects && (
            <p className="text-sm text-muted-foreground">These changes will disconnect and reconnect the printer.</p>
          )}
          {edit.error && <p className="text-sm text-red-600">{edit.error.message}</p>}
        </div>

        <DialogFooter>
          <Button disabled={!can_submit} onClick={() => edit.mutate({ name: printer.name, updates })}>
            <PencilIcon />
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SetFilamentDialog({ printer, onDone }: { printer: PrinterRow; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<SlotDraft[]>(toDrafts(printer.filament));

  const set = useMutation(
    orpc.print.printer.filament.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        onDone();
      },
    }),
  );

  const slot = slots[0];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSlots(toDrafts(printer.filament));
        else set.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PencilIcon />
          Set filament
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">Set {printer.name.toLowerCase()}'s filament</DialogTitle>
          <DialogDescription>
            Tell the printer which filament is loaded. The new temperatures are sent to the machine and saved against
            the printer.
          </DialogDescription>
        </DialogHeader>

        <FilamentSlots slots={slots} onChange={setSlots} single />

        {set.error && <p className="text-sm text-red-600">{set.error.message}</p>}

        <DialogFooter>
          <Button
            disabled={!slotsValid(slots) || set.isPending}
            onClick={() =>
              set.mutate({
                name: printer.name,
                upload: true,
                slot: {
                  material: slot.material,
                  colour: toColour(slot.colour),
                  nozzle_temp_min: slot.nozzle_temp_min,
                  nozzle_temp_max: slot.nozzle_temp_max,
                  bed_temp: slot.bed_temp,
                },
              })
            }
          >
            Save filament
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PrinterFilamentRow({ printer, onDone }: { printer: PrinterRow; onDone: () => void }) {
  const sync = useMutation(orpc.print.printer.filament.mutationOptions({ onSuccess: () => onDone() }));
  const is_ams = printer.driver === "BAMBU";

  return (
    <TableRow>
      <TableCell className="font-medium capitalize">{printer.name.toLowerCase()}</TableCell>
      <TableCell className="capitalize">{printer.model.toLowerCase()}</TableCell>
      <TableCell>{DRIVERS.find((d) => d.value === printer.driver)?.label ?? printer.driver}</TableCell>
      <TableCell className="capitalize">{printer.location.toLowerCase()}</TableCell>
      <TableCell>
        <div className="flex flex-col items-center gap-1">
          {printer.filament.map((slot) => (
            <span key={slot.slot_id} className="flex items-center gap-2 text-sm">
              <Swatch colour={slot.colour} className="size-3" />
              {slot.material}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-center gap-2">
          {is_ams ? (
            <Button
              variant="outline"
              size="sm"
              disabled={sync.isPending}
              onClick={() => sync.mutate({ name: printer.name, upload: false })}
            >
              <RefreshCwIcon />
              {sync.isPending ? "Syncing…" : "Sync filament"}
            </Button>
          ) : (
            <SetFilamentDialog printer={printer} onDone={onDone} />
          )}
          <EditPrinterDialog printer={printer} onDone={onDone} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("PRINTS");
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(query.trim());
      setOffset(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const searching = debounced !== "";

  const queued = useQuery({
    ...orpc.print.queue.get.queryOptions({ input: { by: "all", offset } }),
    enabled: view === "PRINTS" && !searching,
    placeholderData: keepPreviousData,
  });

  const found = useQuery({
    ...orpc.print.queue.search.queryOptions({ input: { query: debounced, offset } }),
    enabled: view === "PRINTS" && searching,
    placeholderData: keepPreviousData,
  });

  const prints = searching ? found : queued;

  const printers = useQuery({
    ...orpc.print.list.queryOptions({ input: { location: "ALL", include_old: false } }),
    enabled: view === "PRINTERS",
  });

  const refreshPrints = () => {
    queryClient.invalidateQueries({ queryKey: orpc.print.queue.get.key() });
    queryClient.invalidateQueries({ queryKey: orpc.print.queue.search.key() });
  };
  const refreshPrinters = () => queryClient.invalidateQueries({ queryKey: orpc.print.list.key() });

  const rows = prints.data ?? [];

  return (
    <div className="flex flex-col">
      <div className="mx-14 mt-8 mb-2 flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-4xl font-futura text-balance">
          <FilePenIcon className="size-8" />
          Edit {view === "PRINTS" ? "prints" : "printers"}.
        </h2>

        <Select value={view} onValueChange={(value) => setView(value as View)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PRINTS">Prints</SelectItem>
            <SelectItem value="PRINTERS">Printers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === "PRINTS" ? (
        <div className="p-6">
          <Card className="p-6">
            <CardHeader className="flex flex-row items-center justify-between gap-2 px-0">
              <span className="flex items-center gap-2 font-bold text-xl">
                <ScrollTextIcon className="size-5" />
                {searching ? "Matching prints" : "Queued prints"}
              </span>
              <div className="relative w-64">
                <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by print name"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <p className="mb-3 text-sm text-muted-foreground">
                Fix a print's priority or filament without the user re-uploading it. Mass and duration are read from the
                gcode, so they only change when the files are replaced. A print that has already started printing can no
                longer be edited.
              </p>
              {prints.isPending ? (
                <div className="flex justify-center p-6">
                  <Hammer />
                </div>
              ) : prints.error ? (
                <div className="p-6">Failed to load prints: {prints.error.message}</div>
              ) : rows.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  {searching ? `No queued prints match "${debounced}"` : "No prints in the queue"}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[900px] [&_td]:text-center [&_th]:text-center">
                      <TableHeader>
                        <TableRow className="[&>th]:h-12 [&>th]:text-base [&>th]:font-semibold">
                          <TableHead>#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Mass</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Filament</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((row, i) => (
                          <TableRow key={row.id}>
                            <TableCell className="text-muted-foreground">{offset + i + 1}</TableCell>
                            <TableCell className="font-medium">
                              <div className="truncate" title={row.print.name}>
                                {row.print.name}
                              </div>
                            </TableCell>
                            <TableCell>{row.print.author.display_name}</TableCell>
                            <TableCell className="capitalize">{row.print.priority.toLowerCase()}</TableCell>
                            <TableCell>{row.print.mass}g</TableCell>
                            <TableCell>{formatRemaining(row.print.duration.total({ unit: "seconds" }))}</TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-1">
                                {row.print.filament.map((slot) => (
                                  <Swatch key={slot.slot_id} colour={slot.colour} className="size-3" />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <PrintStatusBadge state={row.status.state} />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center">
                                <EditPrintDialog print={row.print} state={row.status.state} onDone={refreshPrints} />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <TableButtons offset={offset} count={rows.length} onOffsetChange={setOffset} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-6">
          <Card className="p-6">
            <CardHeader className="flex flex-row items-center gap-2 px-0">
              <span className="flex items-center gap-2 font-bold text-xl">
                <PrinterIcon className="size-5" />
                Printer filament
              </span>
            </CardHeader>
            <CardContent className="px-0">
              <p className="mb-3 text-sm text-muted-foreground">
                Multi-filament printers are the source of truth for their own AMS, so their slots are synced from the
                machine. Single-filament printers are told what has been loaded.
              </p>
              {printers.isPending ? (
                <div className="flex justify-center p-6">
                  <Hammer />
                </div>
              ) : printers.error ? (
                <div className="p-6">Failed to load printers: {printers.error.message}</div>
              ) : (printers.data ?? []).length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No printers found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[860px] [&_td]:text-center [&_th]:text-center">
                    <TableHeader>
                      <TableRow className="[&>th]:h-12 [&>th]:text-base [&>th]:font-semibold">
                        <TableHead>Printer</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Filament</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(printers.data ?? []).map((printer) => (
                        <PrinterFilamentRow key={printer.id} printer={printer} onDone={refreshPrinters} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
