import type { Temporal } from "@js-temporal/polyfill";
import { MaterialSchema, printer_status_FailureReasonSchema } from "@packages/db/zod/modules/printing";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import type { LocationName } from "@packages/types/sign_in";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@packages/ui/components/alert-dialog";
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
import { Textarea } from "@packages/ui/components/textarea";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArchiveIcon, PlusIcon, PowerIcon, PowerOffIcon, PrinterIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import type * as z from "zod";
import { Hammer } from "@/components/loading";
import {
  formatFailureReason,
  type Material,
  MATERIAL_TEMPS,
  PrinterStateBadge,
  Swatch,
} from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";

type FailureReason = z.infer<typeof printer_status_FailureReasonSchema>;
type Manufacturer = "PRUSA" | "BAMBU";

type SlotDraft = {
  id: string;
  material: Material;
  colour: string;
  nozzle_temp_min: number;
  nozzle_temp_max: number;
  bed_temp: number;
};

export const Route = createFileRoute("/_authenticated/_3dponly/printing/_3dpadminonly/disable")({
  component: RouteComponent,
});

const KEY_LABELS: Record<Manufacturer, [string, string]> = {
  PRUSA: ["Username", "Password"],
  BAMBU: ["Serial", "Access code"],
};

function newSlot(material: Material = "PLA"): SlotDraft {
  return { id: crypto.randomUUID(), material, colour: "#000000", ...MATERIAL_TEMPS[material] };
}

function toColour(colour: string): string {
  return `${colour.replace("#", "").toUpperCase()}FF`;
}

function DisablePrinterDialog({ name, onDone }: { name: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [end_time, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [failed, setFailed] = useState(false);
  const [failure_reason, setFailureReason] = useState<FailureReason | null>(null);
  const [note, setNote] = useState("");

  const disable = useMutation(
    orpc.print.printer.disable.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        onDone();
      },
    }),
  );

  const end_in_past = end_time !== "" && new Date(end_time) <= new Date();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) disable.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PowerOffIcon />
          Disable
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">Disable {name.toLowerCase()}</DialogTitle>
          <DialogDescription>
            The printer is taken out of service and no prints can be sent to it until it is enabled again.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="end_time">Back in service</Label>
            <Input
              id="end_time"
              type="datetime-local"
              value={end_time}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <span className="text-xs text-muted-foreground">Leave empty to disable indefinitely.</span>
            {end_in_past && <span className="text-sm text-red-600">The end time must be in the future.</span>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              placeholder="e.g. Nozzle change"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="failed">Printer has failed</Label>
            <Switch id="failed" checked={failed} onCheckedChange={setFailed} />
          </div>

          {failed && (
            <>
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
                    {printer_status_FailureReasonSchema.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {formatFailureReason(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Optional note about the failure"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </>
          )}

          {disable.error && <p className="text-sm text-red-600">{disable.error.message}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={disable.isPending || end_in_past}
            onClick={() =>
              disable.mutate({
                name,
                disabled: {
                  end_time: end_time ? new Date(end_time).toISOString() : undefined,
                  reason: reason.trim() || undefined,
                },
                failed: failed
                  ? { reason: failure_reason ?? undefined, note: note.trim() || undefined }
                  : undefined,
              })
            }
          >
            <PowerOffIcon />
            Disable printer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RemovePrinterDialog({ name, onDone }: { name: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);

  const remove = useMutation(
    orpc.print.name.remove.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        onDone();
      },
    }),
  );

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) remove.reset();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-600">
          <Trash2Icon />
          Retire
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="capitalize">Retire {name.toLowerCase()}?</AlertDialogTitle>
          <AlertDialogDescription>
            This disconnects the printer and marks it as old. Its record and print history stay in the database, but it
            will no longer be connected on startup or appear anywhere in the app. Bringing it back needs a database
            change.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {remove.error && <p className="text-sm text-red-600">{remove.error.message}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={remove.isPending}
            onClick={(event) => {
              event.preventDefault();
              remove.mutate({ name });
            }}
          >
            Retire printer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AddPrinterDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [model, setModel] = useState("");
  const [manufacturer, setManufacturer] = useState<Manufacturer>("PRUSA");
  const [location, setLocation] = useState<LocationName>("MAINSPACE");
  const [keys, setKeys] = useState<[string, string]>(["", ""]);
  const [has_camera, setHasCamera] = useState(true);
  const [connect, setConnect] = useState(true);
  const [slots, setSlots] = useState<SlotDraft[]>([newSlot()]);

  const add = useMutation(
    orpc.print.name.add.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        onDone();
      },
    }),
  );

  const updateSlot = (index: number, slot: Partial<SlotDraft>) =>
    setSlots((current) => current.map((s, i) => (i === index ? { ...s, ...slot } : s)));

  const temps_valid = slots.every((slot) => slot.nozzle_temp_max > slot.nozzle_temp_min);
  const can_submit =
    name.trim() !== "" &&
    ip.trim() !== "" &&
    model.trim() !== "" &&
    keys[0].trim() !== "" &&
    keys[1].trim() !== "" &&
    slots.length > 0 &&
    temps_valid &&
    !add.isPending;

  const [key_one, key_two] = KEY_LABELS[manufacturer];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) add.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Add printer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a printer</DialogTitle>
          <DialogDescription>
            The printer is registered and, unless connection is turned off, connected straight away.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="e.g. ONE" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ip">IP address</Label>
              <Input id="ip" placeholder="e.g. 10.0.0.4" value={ip} onChange={(e) => setIp(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Select value={manufacturer} onValueChange={(value) => setManufacturer(value as Manufacturer)}>
                <SelectTrigger id="manufacturer" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRUSA">Prusa</SelectItem>
                  <SelectItem value="BAMBU">Bambu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="e.g. CORE ONE"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Location</Label>
              <Select value={location} onValueChange={(value) => setLocation(value as LocationName)}>
                <SelectTrigger id="location" className="w-full">
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="key_one">{key_one}</Label>
              <Input id="key_one" value={keys[0]} onChange={(e) => setKeys([e.target.value, keys[1]])} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="key_two">{key_two}</Label>
              <Input
                id="key_two"
                type="password"
                value={keys[1]}
                onChange={(e) => setKeys([keys[0], e.target.value])}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Filament slots</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setSlots((s) => [...s, newSlot()])}>
                <PlusIcon />
                Add slot
              </Button>
            </div>
            {slots.map((slot, index) => (
              <div key={slot.id} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Material</span>
                  <Select
                    value={slot.material}
                    onValueChange={(value) => updateSlot(index, { material: value as Material, ...MATERIAL_TEMPS[value as Material] })}
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
                  <Input
                    type="color"
                    className="h-9 w-16 p-1"
                    value={slot.colour}
                    onChange={(e) => updateSlot(index, { colour: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Nozzle min</span>
                  <Input
                    type="number"
                    className="w-24"
                    value={slot.nozzle_temp_min}
                    onChange={(e) => updateSlot(index, { nozzle_temp_min: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Nozzle max</span>
                  <Input
                    type="number"
                    className="w-24"
                    value={slot.nozzle_temp_max}
                    onChange={(e) => updateSlot(index, { nozzle_temp_max: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Bed</span>
                  <Input
                    type="number"
                    className="w-20"
                    value={slot.bed_temp}
                    onChange={(e) => updateSlot(index, { bed_temp: Number(e.target.value) })}
                  />
                </div>
                {slots.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-600"
                    onClick={() => setSlots((current) => current.filter((_, i) => i !== index))}
                  >
                    <Trash2Icon />
                  </Button>
                )}
              </div>
            ))}
            {!temps_valid && (
              <span className="text-sm text-red-600">Each slot needs a nozzle max above its nozzle min.</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="has_camera">Has a camera</Label>
            <Switch id="has_camera" checked={has_camera} onCheckedChange={setHasCamera} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="connect">Connect now</Label>
            <Switch id="connect" checked={connect} onCheckedChange={setConnect} />
          </div>

          {add.error && <p className="text-sm text-red-600">{add.error.message}</p>}
        </div>

        <DialogFooter>
          <Button
            disabled={!can_submit}
            onClick={() =>
              add.mutate({
                name: name.trim(),
                setup: {
                  ip: ip.trim(),
                  name: name.trim(),
                  manufacturer,
                  slots: slots.map(({ id: _id, ...slot }) => ({ ...slot, colour: toColour(slot.colour) })),
                  has_camera,
                  keys: [keys[0].trim(), keys[1].trim()],
                },
                detail: { model: model.trim(), location },
                connect,
              })
            }
          >
            <PlusIcon />
            Add printer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PrinterRow({
  printer,
  state,
  down_until,
  failure,
  onDone,
}: {
  printer: {
    id: string;
    name: string;
    model: string;
    location: string;
    filament: { slot_id: number; colour: string }[];
  };
  state: string | undefined;
  down_until: Temporal.ZonedDateTime | null;
  failure: { reason: string; note: string } | null;
  onDone: () => void;
}) {
  const enable = useMutation(orpc.print.printer.enable.mutationOptions({ onSuccess: () => onDone() }));
  const out_of_service = state === "disabled" || state === "error";

  return (
    <TableRow>
      <TableCell className="font-medium capitalize">{printer.name.toLowerCase()}</TableCell>
      <TableCell className="capitalize">{printer.model.toLowerCase()}</TableCell>
      <TableCell className="capitalize">{printer.location.toLowerCase()}</TableCell>
      <TableCell>
        <div className="flex justify-center gap-1">
          {printer.filament.map((slot) => (
            <Swatch key={slot.slot_id} colour={slot.colour} className="size-3" />
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col items-center gap-1">
          {state ? <PrinterStateBadge state={state} /> : "…"}
          {failure && (
            <span className="text-xs text-red-600 dark:text-red-400" title={failure.note || undefined}>
              {formatFailureReason(failure.reason)}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {out_of_service ? (down_until ? down_until.toLocaleString() : "Indefinitely") : "—"}
      </TableCell>
      <TableCell>
        <div className="flex justify-center gap-2">
          {out_of_service ? (
            <Button size="sm" disabled={enable.isPending} onClick={() => enable.mutate({ name: printer.name })}>
              <PowerIcon />
              Enable
            </Button>
          ) : (
            <DisablePrinterDialog name={printer.name} onDone={onDone} />
          )}
          <RemovePrinterDialog name={printer.name} onDone={onDone} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function RetiredPrinterRow({
  printer,
  onDone,
}: {
  printer: { name: string; model: string; location: string };
  onDone: () => void;
}) {
  const restore = useMutation(orpc.print.name.restore.mutationOptions({ onSuccess: () => onDone() }));

  return (
    <TableRow>
      <TableCell className="font-medium capitalize">{printer.name.toLowerCase()}</TableCell>
      <TableCell className="capitalize">{printer.model.toLowerCase()}</TableCell>
      <TableCell className="capitalize">{printer.location.toLowerCase()}</TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          disabled={restore.isPending}
          onClick={() => restore.mutate({ name: printer.name })}
        >
          <RotateCcwIcon />
          {restore.isPending ? "Restoring…" : "Restore"}
        </Button>
      </TableCell>
    </TableRow>
  );
}

function RouteComponent() {
  const queryClient = useQueryClient();

  const {
    data: printers,
    isPending,
    error,
  } = useQuery(orpc.print.list.queryOptions({ input: { location: "ALL", include_old: true } }));

  const active = (printers ?? []).filter((printer) => !printer.old);
  const retired = (printers ?? []).filter((printer) => printer.old);

  const statuses = useQueries({
    queries: active.map((printer) => ({
      ...orpc.print.printer.status.status.queryOptions({ input: { name: printer.name } }),
      refetchInterval: 5000,
    })),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: orpc.print.list.key() });
    queryClient.invalidateQueries({ queryKey: orpc.print.printer.status.status.key() });
  };

  const live = new Map(
    active.map((printer, i) => {
      const query = statuses[i];
      return [printer.name, query?.isSuccess ? query.data : undefined];
    }),
  );

  return (
    <div className="flex flex-col">
      <div className="flex">
        <h2 className="mx-14 mt-8 mb-2 flex items-center gap-2 text-4xl font-futura text-balance">
          <PowerOffIcon className="size-8" />
          Printer availability.
        </h2>
      </div>
      <div className="p-6">
        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between gap-2 px-0">
            <span className="flex items-center gap-2 font-bold text-xl">
              <PrinterIcon className="size-5" />
              Printers
            </span>
            <AddPrinterDialog onDone={refresh} />
          </CardHeader>
          <CardContent className="px-0">
            {isPending ? (
              <div className="flex justify-center p-6">
                <Hammer />
              </div>
            ) : error ? (
              <div className="p-6">Failed to load printers: {error.message}</div>
            ) : active.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No printers found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[860px] [&_td]:text-center [&_th]:text-center">
                  <TableHeader>
                    <TableRow className="[&>th]:h-12 [&>th]:text-base [&>th]:font-semibold">
                      <TableHead>Printer</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Filament</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Back in service</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {active.map((printer) => {
                      const detail = live.get(printer.name);
                      return (
                        <PrinterRow
                          key={printer.id}
                          printer={printer}
                          state={detail?.status.state}
                          down_until={detail?.down_until ?? null}
                          failure={detail?.failure ?? null}
                          onDone={refresh}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {retired.length > 0 && (
        <div className="px-6 pb-6">
          <Card className="p-6">
            <CardHeader className="flex flex-row items-center gap-2 px-0">
              <span className="flex items-center gap-2 font-bold text-xl">
                <ArchiveIcon className="size-5" />
                Retired printers
              </span>
            </CardHeader>
            <CardContent className="px-0">
              <p className="mb-3 text-sm text-muted-foreground">
                These printers are kept in the database for their print history. They are not connected on startup and
                take no prints until they are restored.
              </p>
              <div className="overflow-x-auto">
                <Table className="min-w-[560px] [&_td]:text-center [&_th]:text-center">
                  <TableHeader>
                    <TableRow className="[&>th]:h-12 [&>th]:text-base [&>th]:font-semibold">
                      <TableHead>Printer</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retired.map((printer) => (
                      <RetiredPrinterRow key={printer.id} printer={printer} onDone={refresh} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
