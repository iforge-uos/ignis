import { Temporal } from "@js-temporal/polyfill";
import { Card, CardContent, CardHeader } from "@packages/ui/components/card";
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

export const Route = createFileRoute("/_authenticated/printing/user/history")({
  component: RouteComponent,
});

function RouteComponent() {
  const [year, setYear] = useState(CURRENT_ACADEMIC_YEAR);
  const { start_time, end_time } = academicYearRange(year);

  const { data, isPending, error } = useQuery({
    ...orpc.print.public.users.stats.queryOptions({ input: { start_time, end_time } }),
    placeholderData: keepPreviousData,
  });

  if (isPending)
    return (
      <div className="flex justify-center p-6">
        <Hammer />
      </div>
    );
  if (error) return <div className="p-6">Failed to load printers: {error.message}</div>;

  const period_print_dur = formatRemaining(Temporal.Duration.from(data.period_print_time).total("seconds"));
  const total_print_dur = formatRemaining(Temporal.Duration.from(data.total_print_duration).total("seconds"));

  return (
    <div>
      <div className="flex">
        <h2 className="mx-14 mt-8 mb-2 flex items-center gap-2 text-4xl font-futura text-balance">
          Your 3d print stats at the University of Sheffield's iForge.
        </h2>
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
            <CardHeader className="text-left text-3xl font-bold font-futura">Your All-Time Stats:</CardHeader>
            <CardContent>
              <Stat label="Prints" value={data.total_prints} />
              <Stat label="Successful" value={data.total_successful_prints} />
              <Stat label="Failed" value={data.total_failed_prints} />
              <Stat label="Success rate" value={`${data.total_success_rate.toFixed(1)}%`} />
              <Stat label="Filament used" value={formatMass(data.total_print_mass)} />
              <Stat label="Print time" value={total_print_dur} />
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
              <span>Your Stats for {academicLabel(year)}:</span>
              <AcademicYearPicker year={year} onYearChange={setYear} />
            </CardHeader>
            <CardContent>
              <Stat label="Prints" value={data.period_prints} />
              <Stat label="Successful" value={data.period_successful_prints} />
              <Stat label="Failed" value={data.period_failed_prints} />
              <Stat label="Success rate" value={`${data.period_success_rate.toFixed(1)}%`} />
              <Stat label="Filament used" value={formatMass(data.period_print_mass)} />
              <Stat label="Print time" value={period_print_dur} />
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
