import { useQueries, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PrinterIcon } from "lucide-react";
import { Hammer } from "@/components/loading";
import { PrinterCard } from "@/components/printing/public";
import { FilamentChip, formatMass, formatRemaining } from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/_authenticated/_3dponly/printing/printers/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: printers, isPending, error } = useQuery(orpc.print.public.printers.queryOptions());

  const statuses = useQueries({
    queries: (printers ?? []).map(({ printer }) => ({
      ...orpc.print.printer.status.status.queryOptions({ input: { name: printer.name } }),
      refetchInterval: 5000,
    })),
  });

  if (isPending)
    return (
      <div className="flex justify-center p-6">
        <Hammer />
      </div>
    );
  if (error) return <div className="p-6">Failed to load printers: {error.message}</div>;

  const live = new Map(
    printers.map(({ printer }, i) => {
      const query = statuses[i];
      return [printer.name, query?.isSuccess ? query.data : undefined];
    }),
  );

  return (
    <div className="flex flex-col">
      <div className="flex">
        <h2 className="mx-14 mt-8 mb-2 flex items-center gap-2 text-4xl font-futura text-balance">
          <PrinterIcon className="size-8" />
          Printer overview.
        </h2>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {printers.map(({ printer, status }) => {
          const detail = live.get(printer.name);
          const job = detail?.status.current_job;

          return (
            <Link
              key={printer.id}
              to="/printing/printers/$name"
              params={{ name: printer.name }}
              className="group flex flex-col gap-3 rounded-xl border p-4 transition hover:border-primary hover:shadow-md"
            >
              <PrinterCard printer={printer} status={detail?.status ?? status} />

              <div className="flex flex-wrap gap-2">
                {printer.filament.map((slot) => (
                  <FilamentChip key={slot.slot_id} material={slot.material} colour={slot.colour} />
                ))}
              </div>

              <div className="truncate text-xs text-muted-foreground">
                {job ? (
                  <>
                    <span className="font-medium text-foreground">{job.print_job.name}</span> - {job.print_job.queue}
                  </>
                ) : detail?.down_until ? (
                  `Disabled until ${detail.down_until.toLocaleString()}`
                ) : (
                  "No job running"
                )}
              </div>

              <div className="flex justify-between border-t pt-2 text-xs text-muted-foreground">
                <span>{formatMass(printer.total_print_mass)} used</span>
                <span>{formatRemaining(printer.total_print_time.total({ unit: "seconds" }))} printed</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
