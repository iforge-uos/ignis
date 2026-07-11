import { Card, CardContent, CardHeader } from "@packages/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Hammer } from "@/components/loading";
import {
  AcademicYearPicker,
  academicLabel,
  academicYearRange,
  CURRENT_ACADEMIC_YEAR,
  formatMass,
  formatRemaining,
  Stat,
} from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";

const ALL_PRINTERS = "ALL";

export const Route = createFileRoute("/_authenticated/_3dponly/printing/stats/printer")({
  component: RouteComponent,
});

function rate(part: number, whole: number): string {
  return `${(whole > 0 ? (part / whole) * 100 : 0).toFixed(1)}%`;
}

function RouteComponent() {
  const [year, setYear] = useState(CURRENT_ACADEMIC_YEAR);
  const [printer_id, setPrinterId] = useState<string>(ALL_PRINTERS);
  const { start_time, end_time } = academicYearRange(year);

  const { data, isPending, error } = useQuery({
    ...orpc.print.history.stats.queryOptions({ input: { start_time, end_time } }),
    placeholderData: keepPreviousData,
  });

  if (isPending)
    return (
      <div className="flex justify-center p-6">
        <Hammer />
      </div>
    );
  if (error) return <div className="p-6">Failed to load printer stats: {error.message}</div>;

  const selected = data.printers.find((p) => p.id === printer_id);
  const stats = selected ?? data.total;
  const subject = selected ? selected.name.toLowerCase() : "all printers";

  return (
    <div>
      <div className="mx-14 mt-8 mb-2 flex flex-wrap items-center gap-6">
        <h2 className="flex items-center gap-2 text-4xl font-futura text-balance">
          3d printer stats at the University of Sheffield's iForge.
        </h2>
        <Select value={printer_id} onValueChange={setPrinterId}>
          <SelectTrigger className="ml-auto w-56">
            <SelectValue placeholder="Printer name" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PRINTERS}>All printers</SelectItem>
            {data.printers.map((printer) => (
              <SelectItem key={printer.id} value={printer.id} className="capitalize">
                {printer.name.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative flex flex-col sm:flex-row gap-8 mb-8 px-8">
        <Card className="relative flex-1 overflow-hidden p-6">
          <img
            src="/machines/3d-printer.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-6 -bottom-6 w-48 opacity-20 select-none"
          />
          <div className="relative z-10">
            <CardHeader className="text-left text-3xl font-bold font-futura capitalize">
              All-Time Stats for {subject}:
            </CardHeader>
            <CardContent>
              <Stat label="Prints" value={stats.total_print_jobs} />
              <Stat label="Successful" value={stats.total_successful_jobs} />
              <Stat label="Failed" value={stats.total_failed_jobs} />
              <Stat label="Success rate" value={rate(stats.total_successful_jobs, stats.total_print_jobs)} />
              <Stat label="Filament used" value={formatMass(stats.total_print_mass)} />
              <Stat label="Print time" value={formatRemaining(stats.total_print_time)} />
              <Stat label="Average attempts" value={stats.total_average_attempts.toFixed(2)} />
              <Stat label="Downtime" value={formatRemaining(stats.total_downtime)} />
            </CardContent>
          </div>
        </Card>

        <Card className="relative flex-1 overflow-hidden p-6">
          <img
            src="/printing/bambu-h2d.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-6 -bottom-6 w-48 opacity-20 select-none"
          />
          <div className="relative z-10">
            <CardHeader className="flex flex-row items-center justify-between gap-2 text-left text-3xl font-bold font-futura">
              <span className="capitalize">
                {subject}'s Stats for {academicLabel(year)}:
              </span>
              <AcademicYearPicker year={year} onYearChange={setYear} />
            </CardHeader>
            <CardContent>
              <Stat label="Prints" value={stats.period_print_jobs} />
              <Stat label="Successful" value={stats.period_successful_jobs} />
              <Stat label="Failed" value={stats.period_failed_jobs} />
              <Stat label="Success rate" value={rate(stats.period_successful_jobs, stats.period_print_jobs)} />
              <Stat label="Filament used" value={formatMass(stats.period_print_mass)} />
              <Stat label="Print time" value={formatRemaining(stats.period_print_time)} />
              <Stat label="Utilisation" value={`${stats.period_print_time_percent.toFixed(1)}%`} />
              <Stat label="Average attempts" value={stats.period_average_attempts.toFixed(2)} />
              <Stat label="Downtime" value={formatRemaining(stats.period_downtime)} />
              <Stat label="Downtime %" value={`${stats.period_downtime_percent.toFixed(1)}%`} />
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
