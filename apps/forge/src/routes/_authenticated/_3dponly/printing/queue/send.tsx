import type { Temporal } from "@js-temporal/polyfill";
import { print_status_FailureReasonSchema } from "@packages/db/zod/modules/printing";
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
import { Label } from "@packages/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { Switch } from "@packages/ui/components/switch";
import { Textarea } from "@packages/ui/components/textarea";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckIcon,
  type LucideIcon,
  PauseIcon,
  PlayIcon,
  PrinterXIcon,
  SendIcon,
  UnplugIcon,
  XIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import type * as z from "zod";
import { Hammer } from "@/components/loading";
import { formatFailureReason, formatRemaining, PrinterStateBadge, stateStyle } from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";

type FailureReason = z.infer<typeof print_status_FailureReasonSchema>;

export const Route = createFileRoute("/_authenticated/_3dponly/printing/queue/send")({
  component: RouteComponent,
});

function FinishPrintDialog({ name, onDone }: { name: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(true);
  const [requeue, setRequeue] = useState(false);
  const [review, setReview] = useState(false);
  const [reason, setReason] = useState<FailureReason | null>(null);
  const [message, setMessage] = useState("");

  const finish = useMutation(
    orpc.print.printer.finish.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        onDone();
      },
    }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CheckIcon />
          Finish
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">Finish {name.toLowerCase()}'s print</DialogTitle>
          <DialogDescription>Record how the print ended before clearing the printer.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="success">Successful</Label>
            <Switch id="success" checked={success} onCheckedChange={setSuccess} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="requeue">Requeue print</Label>
            <Switch id="requeue" checked={requeue} onCheckedChange={setRequeue} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="review">Send to review</Label>
            <Switch id="review" checked={review} onCheckedChange={setReview} />
          </div>

          {!success && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="reason">Failure reason</Label>
              <Select value={reason ?? ""} onValueChange={(value) => setReason(value as FailureReason)}>
                <SelectTrigger id="reason" className="w-full">
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
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Optional note for the print"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {finish.error && <p className="text-sm text-red-600">{finish.error.message}</p>}
        </div>

        <DialogFooter>
          <Button
            disabled={finish.isPending}
            onClick={() =>
              finish.mutate({
                name,
                success,
                requeue,
                review,
                reason: success ? undefined : (reason ?? undefined),
                message: message.trim() || undefined,
              })
            }
          >
            <CheckIcon />
            Finish print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const SEND_QUEUE_LIMIT = 10;

function SendPrintDialog({ name, onDone }: { name: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isPending, error } = useQuery({
    ...orpc.print.queue.get.queryOptions({ input: { by: "printer", value: name, offset: 0 } }),
    enabled: open,
  });

  const send = useMutation(
    orpc.print.queue.send.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        onDone();
      },
    }),
  );

  const rows = (data ?? []).slice(0, SEND_QUEUE_LIMIT);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSelected(null);
          send.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <SendIcon />
          Send a print
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="capitalize">Send a print to {name.toLowerCase()}</DialogTitle>
          <DialogDescription>Choose a print to send to this printer.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {isPending ? (
            <div className="flex justify-center p-6">
              <Hammer />
            </div>
          ) : error ? (
            <div className="p-6">Failed to load prints: {error.message}</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No prints queued for this printer</div>
          ) : (
            <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
              {rows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelected(row.print.id)}
                  className={`flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors ${
                    selected === row.print.id ? "border-primary bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-medium" title={row.print.name}>
                      {row.print.name} - {formatRemaining(row.print.duration.total({ unit: "seconds" }))}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">#{row.position}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{row.print.author.display_name}</span>
                    <span className="capitalize">{row.print.priority.toLowerCase()} priority</span>
                    <span>{row.print.filament.length > 1 ? "Multi" : row.print.filament[0]?.material}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {send.error && <p className="text-sm text-red-600">{send.error.message}</p>}
        </div>

        <DialogFooter>
          <Button
            disabled={!selected || send.isPending}
            onClick={() => selected && send.mutate({ id: selected, printer: name })}
          >
            <SendIcon />
            Send print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StateMessage({ state, icon: Icon, children }: { state: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <div className={`flex items-center gap-4 rounded-lg px-4 py-3 ${stateStyle(state)}`}>
      <Icon className="size-5 shrink-0" />
      <p className="font-medium">{children}</p>
    </div>
  );
}

export function StateCard({
  name,
  state,
  down_end,
  onAction,
}: {
  name: string;
  state: string;
  down_end: Temporal.ZonedDateTime | null;
  onAction: () => void;
}) {
  const options = { onSuccess: () => onAction() };
  const pause = useMutation(orpc.print.printer.pause.mutationOptions(options));
  const resume = useMutation(orpc.print.printer.resume.mutationOptions(options));
  const cancel = useMutation(orpc.print.printer.cancel.mutationOptions(options));

  const busy = pause.isPending || resume.isPending || cancel.isPending;

  return (
    <Card className="flex-1 gap-6 p-6">
      <div className="flex items-center gap-3">
        <span className="font-bold text-xl capitalize">{name.toLowerCase()}</span>
        <PrinterStateBadge state={state} />
      </div>
      {state === "printing" && (
        <div className="flex gap-3">
          <Button variant="outline" disabled={busy} onClick={() => pause.mutate({ name })}>
            <PauseIcon />
            Pause
          </Button>
          <Button variant="destructive" disabled={busy} onClick={() => cancel.mutate({ name })}>
            <XIcon />
            Cancel
          </Button>
        </div>
      )}
      {state === "paused" && (
        <div className="flex gap-3">
          <Button disabled={busy} onClick={() => resume.mutate({ name })}>
            <PlayIcon />
            Resume
          </Button>
          <Button variant="destructive" disabled={busy} onClick={() => cancel.mutate({ name })}>
            <XIcon />
            Cancel
          </Button>
        </div>
      )}
      {state === "finished" && <FinishPrintDialog name={name} onDone={onAction} />}
      {state === "idle" && <SendPrintDialog name={name} onDone={onAction} />}
      {state === "disconnected" && (
        <StateMessage state={state} icon={PrinterXIcon}>
          Printer is disconnected - no actions available
        </StateMessage>
      )}
      {state === "error" && (
        <StateMessage state={state} icon={PrinterXIcon}>
          Printer has failed, please fix before proceeding
        </StateMessage>
      )}
      {state === "disabled" && (
        <StateMessage state={state} icon={UnplugIcon}>
          Printer has been disabled {down_end ? `until ${down_end.toLocaleString()}` : "indefinitely"}
        </StateMessage>
      )}
    </Card>
  );
}

function RouteComponent() {
  const [location, setLocation] = useState<LocationName>("MAINSPACE");
  const [selected, setSelected] = useState<string | null>(null);

  const { data: printers, isPending, error } = useQuery(orpc.print.list.queryOptions({ input: { location } }));

  const statuses = useQueries({
    queries: (printers ?? []).map((printer) => ({
      ...orpc.print.printer.status.status.queryOptions({ input: { name: printer.name } }),
      refetchInterval: 5000,
    })),
  });

  const live = new Map(
    (printers ?? []).map((printer, i) => {
      const query = statuses[i];
      return [printer.name, query?.isSuccess ? query.data.status.state : undefined];
    }),
  );

  const status = useQuery({
    ...orpc.print.printer.status.status.queryOptions({ input: { name: selected ?? "" } }),
    enabled: !!selected,
  });

  const state = status.data?.status.state ?? "disconnected";

  return (
    <>
      <div className="flex">
        <h2 className="mx-14 mt-8 -mb-2 flex items-center gap-2 text-4xl font-futura text-balance">
          Control and send prints to the iForge 3D printers.
        </h2>
      </div>
      <div className="flex gap-6 p-6">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between gap-2 -mb-2">
            <span className="font-bold text-xl">Select a printer:</span>
            <Select
              value={location}
              onValueChange={(value) => {
                setLocation(value as LocationName);
                setSelected(null);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LocationNameSchema.options.map((name) => (
                  <SelectItem key={name} value={name} className="capitalize">
                    {name.toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="flex justify-center p-6">
                <Hammer />
              </div>
            ) : error ? (
              <div className="p-6">Failed to load printers: {error.message}</div>
            ) : printers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No printers found</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {printers.map((printer) => {
                  const printer_state = live.get(printer.name);
                  return (
                    <button
                      key={printer.id}
                      type="button"
                      onClick={() => setSelected(printer.name)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                        selected === printer.name ? "border-primary bg-primary/10" : "hover:bg-muted"
                      }`}
                    >
                      {printer.name.toLowerCase()}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${stateStyle(printer_state ?? "")}`}
                      >
                        {printer_state ?? "…"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {selected && (
        <div className="flex gap-6 p-6 -mt-6">
          <StateCard
            name={selected}
            state={state ?? "disconnected"}
            down_end={status.data?.down_until ?? null}
            onAction={() => status.refetch()}
          />
        </div>
      )}
    </>
  );
}
