import { Badge } from "@packages/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@packages/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangleIcon, LayersIcon, PrinterIcon } from "lucide-react";
import * as z from "zod";
import { Hammer } from "@/components/loading";
import { PrinterCard } from "@/components/printing/public";
import { FilamentChip, formatMass, formatRemaining, hex, STATE_STYLES, Swatch } from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/_authenticated/_3dponly/printing/printers/$name")({
  component: RouteComponent,
  params: {
    parse: z.object({
      name: z.string().min(1),
    }).parse,
  },
});

function RouteComponent() {
  const { name } = Route.useParams();

  const printer = useQuery({
    ...orpc.print.public.printer.queryOptions({ input: { name } }),
    refetchInterval: 5000,
  });
  const live = useQuery({
    ...orpc.print.printer.status.status.queryOptions({ input: { name } }),
    refetchInterval: 5000,
  });

  if (printer.isPending)
    return (
      <div className="flex justify-center p-6">
        <Hammer />
      </div>
    );
  if (printer.error) return <div className="p-6">Failed to load printer: {printer.error.message}</div>;

  const detail = live.isSuccess ? live.data : undefined;
  const status = detail?.status ?? printer.data.status;
  const down_until = detail?.down_until ?? null;
  const job = detail?.status.current_job;
  const errors = detail?.status.errors ?? [];
  const { filament, total_print_mass, total_print_time } = printer.data.printer;

  return (
    <div className="flex flex-col">
      <div className="flex">
        <h2 className="mx-14 mt-8 mb-2 flex items-center gap-2 text-4xl font-futura text-balance capitalize">
          <PrinterIcon className="size-8" />
          {name.toLowerCase()}
        </h2>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div className="flex h-fit w-full flex-col gap-3 rounded-xl border p-4">
          <PrinterCard printer={printer.data.printer} status={status} />
        </div>

        <div className="flex flex-col gap-6">
          {(status.state === "disabled" || errors.length > 0) && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <AlertTriangleIcon className="size-5 text-amber-600" />
                <CardTitle>Attention</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                {status.state === "disabled" && (
                  <div>Disabled {down_until ? `until ${down_until.toLocaleString()}` : "indefinitely"}</div>
                )}
                {errors.map((error) => (
                  <div key={error} className="text-red-600 dark:text-red-400">
                    {error}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Current job</CardTitle>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                  STATE_STYLES[status.state] ?? STATE_STYLES.disconnected
                }`}
              >
                {status.state}
              </span>
            </CardHeader>
            <CardContent>
              {job ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium" title={job.print_job.name}>
                        {job.print_job.name}
                      </div>
                      <div className="truncate font-mono text-xs text-muted-foreground">{job.print_job.uuid}</div>
                    </div>
                    <Badge variant="outline">{job.print_job.queue}</Badge>
                  </div>

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

                  <div className="flex flex-wrap gap-2">
                    {job.print_job.filament.map((slot) => (
                      <FilamentChip key={slot.slot_id} material={slot.material} colour={slot.colour} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {status.state === "disconnected" ? "Printer is not connected." : "No job running."}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <LayersIcon className="size-5 text-muted-foreground" />
              <CardTitle>Loaded filament</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {filament.length === 0 ? (
                <div className="text-sm text-muted-foreground">No filament configured.</div>
              ) : (
                filament.map((slot) => (
                  <div key={slot.slot_id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                        {slot.slot_id + 1}
                      </span>
                      <Swatch colour={slot.colour} className="size-6" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{slot.material}</span>
                        <span className="font-mono text-xs text-muted-foreground">{hex(slot.colour)}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>
                        Nozzle {slot.nozzle_temp_min}-{slot.nozzle_temp_max}°
                      </div>
                      <div>Bed {slot.bed_temp}°</div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lifetime</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-8 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Filament used</span>
                <span className="font-medium">{formatMass(total_print_mass)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Time printed</span>
                <span className="font-medium">{formatRemaining(total_print_time.total({ unit: "seconds" }))}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
