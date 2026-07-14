import type { Temporal } from "@js-temporal/polyfill";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarClockIcon, HistoryIcon, PlusIcon, PowerIcon, Trash2Icon, WrenchIcon } from "lucide-react";
import { useState } from "react";
import { Hammer } from "@/components/loading";
import { formatRemaining, TableButtons } from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/_authenticated/_3dponly/printing/_3dpadminonly/downtime")({
  component: RouteComponent,
});

type Downtime = {
  id: string;
  start_time: Temporal.ZonedDateTime;
  end_time: Temporal.ZonedDateTime | null;
  reason: string | null;
  printer: { id: string; name: string };
};

function localInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function started(downtime: Downtime): boolean {
  return downtime.start_time.epochMilliseconds <= Date.now();
}

function span(downtime: Downtime): string {
  if (!downtime.end_time) return "—";
  const seconds = (downtime.end_time.epochMilliseconds - downtime.start_time.epochMilliseconds) / 1000;
  return formatRemaining(seconds);
}

function ScheduleDowntimeDialog({ names, onDone }: { names: string[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [start_time, setStartTime] = useState(localInput(new Date()));
  const [end_time, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  const add = useMutation(
    orpc.print.printer.downtime.add.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        onDone();
      },
    }),
  );

  const end_before_start = end_time !== "" && new Date(end_time) <= new Date(start_time);
  const can_submit = name !== "" && start_time !== "" && !end_before_start && !add.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setStartTime(localInput(new Date()));
          setEndTime("");
          setReason("");
        } else {
          add.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Schedule downtime
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule downtime</DialogTitle>
          <DialogDescription>
            The printer is taken out of service when the window starts and returns when it ends. Leave the end empty to
            keep it down until it is brought back manually.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="printer">Printer</Label>
            <Select value={name} onValueChange={setName}>
              <SelectTrigger id="printer" className="w-full">
                <SelectValue placeholder="Select a printer" />
              </SelectTrigger>
              <SelectContent>
                {names.map((printer) => (
                  <SelectItem key={printer} value={printer} className="capitalize">
                    {printer.toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start_time">Starts</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={start_time}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end_time">Ends</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={end_time}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          {end_before_start && <span className="text-sm text-red-600">The end must be after the start.</span>}

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              placeholder="e.g. Nozzle change"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {add.error && <p className="text-sm text-red-600">{add.error.message}</p>}
        </div>

        <DialogFooter>
          <Button
            disabled={!can_submit}
            onClick={() =>
              add.mutate({
                name,
                start_time: new Date(start_time).toISOString(),
                end_time: end_time ? new Date(end_time).toISOString() : undefined,
                reason: reason.trim() || undefined,
              })
            }
          >
            <PlusIcon />
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DowntimeRow({ downtime, onDone }: { downtime: Downtime; onDone: () => void }) {
  const active = started(downtime);

  const cancel = useMutation(orpc.print.printer.downtime.remove.mutationOptions({ onSuccess: () => onDone() }));
  const end_now = useMutation(orpc.print.printer.enable.mutationOptions({ onSuccess: () => onDone() }));

  return (
    <TableRow>
      <TableCell className="font-medium capitalize">{downtime.printer.name.toLowerCase()}</TableCell>
      <TableCell>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            active
              ? "bg-red-500/15 text-red-600 dark:text-red-400"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
          }`}
        >
          {active ? "Active" : "Scheduled"}
        </span>
      </TableCell>
      <TableCell>{downtime.start_time.toLocaleString()}</TableCell>
      <TableCell>{downtime.end_time ? downtime.end_time.toLocaleString() : "Indefinitely"}</TableCell>
      <TableCell>{span(downtime)}</TableCell>
      <TableCell className="text-muted-foreground">{downtime.reason ?? "—"}</TableCell>
      <TableCell>
        <div className="flex justify-center">
          {active ? (
            <Button
              size="sm"
              disabled={end_now.isPending}
              onClick={() => end_now.mutate({ name: downtime.printer.name })}
            >
              <PowerIcon />
              End now
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-600"
              disabled={cancel.isPending}
              onClick={() => cancel.mutate({ name: downtime.printer.name, id: downtime.id })}
            >
              <Trash2Icon />
              Cancel
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function HistoryCard({ names }: { names: string[] }) {
  const [name, setName] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, isPending, error } = useQuery({
    ...orpc.print.printer.downtime.list.queryOptions({ input: { name, history: true, offset } }),
    enabled: name !== "",
    placeholderData: keepPreviousData,
  });

  const rows = data ?? [];

  return (
    <Card className="p-6">
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-0">
        <span className="flex items-center gap-2 font-bold text-xl">
          <HistoryIcon className="size-5" />
          Past downtime
        </span>
        <Select
          value={name}
          onValueChange={(value) => {
            setName(value);
            setOffset(0);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a printer" />
          </SelectTrigger>
          <SelectContent>
            {names.map((printer) => (
              <SelectItem key={printer} value={printer} className="capitalize">
                {printer.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-0">
        {name === "" ? (
          <div className="p-6 text-center text-muted-foreground">Select a printer to see its past downtime</div>
        ) : isPending ? (
          <div className="flex justify-center p-6">
            <Hammer />
          </div>
        ) : error ? (
          <div className="p-6">Failed to load downtime: {error.message}</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No past downtime found</div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto">
              <Table className="min-w-[720px] [&_td]:text-center [&_th]:text-center">
                <TableHeader>
                  <TableRow className="[&>th]:h-12 [&>th]:text-base [&>th]:font-semibold">
                    <TableHead>#</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Ended</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-muted-foreground">{offset + i + 1}</TableCell>
                      <TableCell>{row.start_time.toLocaleString()}</TableCell>
                      <TableCell>{row.end_time ? row.end_time.toLocaleString() : "—"}</TableCell>
                      <TableCell>{span(row)}</TableCell>
                      <TableCell className="text-muted-foreground">{row.reason ?? "—"}</TableCell>
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
  );
}

function RouteComponent() {
  const queryClient = useQueryClient();

  const { data: printers } = useQuery(orpc.print.list.queryOptions({ input: { location: "ALL", include_old: false } }));

  const { data, isPending, error } = useQuery({
    ...orpc.print.printer.downtime.all.queryOptions(),
    refetchInterval: 30_000,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: orpc.print.printer.downtime.key() });
    queryClient.invalidateQueries({ queryKey: orpc.print.printer.status.status.key() });
  };

  const names = (printers ?? []).map((printer) => printer.name);
  const sorted = [...(data ?? [])].sort((a, b) => a.start_time.epochMilliseconds - b.start_time.epochMilliseconds);

  return (
    <div className="flex flex-col">
      <div className="flex">
        <h2 className="mx-14 mt-8 mb-2 flex items-center gap-2 text-4xl font-futura text-balance">
          <WrenchIcon className="size-8" />
          Printer downtime.
        </h2>
      </div>

      <div className="p-6">
        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between gap-2 px-0">
            <span className="flex items-center gap-2 font-bold text-xl">
              <CalendarClockIcon className="size-5" />
              Active and scheduled
            </span>
            <ScheduleDowntimeDialog names={names} onDone={refresh} />
          </CardHeader>
          <CardContent className="px-0">
            <p className="mb-3 text-sm text-muted-foreground">
              A printer is taken out of service while a window is active and no prints are sent to it. Scheduled windows
              can be cancelled; active ones can be ended early.
            </p>
            {isPending ? (
              <div className="flex justify-center p-6">
                <Hammer />
              </div>
            ) : error ? (
              <div className="p-6">Failed to load downtime: {error.message}</div>
            ) : sorted.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No printers are down or scheduled to go down</div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[860px] [&_td]:text-center [&_th]:text-center">
                  <TableHeader>
                    <TableRow className="[&>th]:h-12 [&>th]:text-base [&>th]:font-semibold">
                      <TableHead>Printer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Starts</TableHead>
                      <TableHead>Ends</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((downtime) => (
                      <DowntimeRow key={downtime.id} downtime={downtime} onDone={refresh} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="px-6 pb-6">
        <HistoryCard names={names} />
      </div>
    </div>
  );
}
