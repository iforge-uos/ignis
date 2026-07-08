import { Temporal } from "@js-temporal/polyfill";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardHeader } from "@packages/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Hammer } from "@/components/loading";
import { formatRemaining } from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";

const NOW = new Date();
const CURRENT_ACADEMIC_YEAR = NOW.getMonth() >= 8 ? NOW.getFullYear() : NOW.getFullYear() - 1;
const FIRST_YEAR = 2026;
const YEARS = Array.from({ length: CURRENT_ACADEMIC_YEAR - FIRST_YEAR + 1 }, (_, i) => CURRENT_ACADEMIC_YEAR - i);

export const Route = createFileRoute("/_authenticated/printing/user/history")({
  component: RouteComponent,
});

function academicLabel(startYear: number): string {
  return `${startYear}/${String((startYear + 1) % 100).padStart(2, "0")}`;
}

function formatMass(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${Math.round(grams)} g`;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b py-1.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function RouteComponent() {
  const [year, setYear] = useState(CURRENT_ACADEMIC_YEAR);
  const start_time = new Date(Date.UTC(year, 8, 1)).toISOString();
  const end_time = new Date(Date.UTC(year + 1, 8, 1) - 1).toISOString();

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 text-base">
                    {academicLabel(year)}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                    {YEARS.map((y) => (
                      <DropdownMenuRadioItem key={y} value={String(y)}>
                        {academicLabel(y)}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
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
