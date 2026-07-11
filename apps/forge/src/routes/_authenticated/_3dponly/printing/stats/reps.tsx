import { Card, CardContent, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TrophyIcon } from "lucide-react";
import { useState } from "react";
import { Hammer } from "@/components/loading";
import {
  AcademicYearPicker,
  academicLabel,
  academicYearRange,
  CURRENT_ACADEMIC_YEAR,
  type SelectedUser,
  Stat,
  UserSearch,
} from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";

const LEADERBOARD_SIZE = 10;

type Metric = "PRINTS" | "SUCCESSFUL" | "FAILED";

const METRIC_LABELS: Record<Metric, string> = {
  PRINTS: "Most approved",
  SUCCESSFUL: "Most successful",
  FAILED: "Most failed",
};

const NO_APPROVALS = {
  total_prints: 0,
  total_successful_prints: 0,
  total_failed_prints: 0,
  period_prints: 0,
  period_successful_prints: 0,
  period_failed_prints: 0,
};

export const Route = createFileRoute("/_authenticated/_3dponly/printing/stats/reps")({
  component: RouteComponent,
});

type Ranking = { firstname: string; lastname: string; score: number }[];

function rate(part: number, whole: number): string {
  return `${(whole > 0 ? (part / whole) * 100 : 0).toFixed(1)}%`;
}

function Leaderboard({ title, ranking }: { title: string; ranking: Ranking }) {
  const rows = ranking.filter((r) => r.score > 0).slice(0, LEADERBOARD_SIZE);
  return (
    <Card className="relative flex-1 overflow-hidden p-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-futura">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {rows.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No prints in this period</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Rep</TableHead>
                <TableHead className="text-right">Approved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={`${r.firstname}-${r.lastname}-${r.score}`}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">
                    {r.firstname} {r.lastname}
                  </TableCell>
                  <TableCell className="text-right">{r.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const [year, setYear] = useState(CURRENT_ACADEMIC_YEAR);
  const [rep, setRep] = useState<SelectedUser | null>(null);
  const [metric, setMetric] = useState<Metric>("PRINTS");
  const { start_time, end_time } = academicYearRange(year);

  const { data, isPending, error } = useQuery({
    ...orpc.print.history.competition.queryOptions({ input: { start_time, end_time } }),
    placeholderData: keepPreviousData,
  });

  if (isPending)
    return (
      <div className="flex justify-center p-6">
        <Hammer />
      </div>
    );
  if (error) return <div className="p-6">Failed to load rep stats: {error.message}</div>;

  const reps = data.rep_stats;
  const subject = rep ? rep.display_name : "all reps";

  const sum = (pick: (r: (typeof reps)[number]) => number) => reps.reduce((acc, r) => acc + pick(r), 0);

  const stats = rep
    ? (reps.find((r) => r.id === rep.id) ?? NO_APPROVALS)
    : {
        total_prints: sum((r) => r.total_prints),
        total_successful_prints: sum((r) => r.total_successful_prints),
        total_failed_prints: sum((r) => r.total_failed_prints),
        period_prints: sum((r) => r.period_prints),
        period_successful_prints: sum((r) => r.period_successful_prints),
        period_failed_prints: sum((r) => r.period_failed_prints),
      };

  const total_ranking: Record<Metric, Ranking> = {
    PRINTS: data.total_most_prints,
    SUCCESSFUL: data.total_most_successful_prints,
    FAILED: data.total_most_failed_prints,
  };
  const period_ranking: Record<Metric, Ranking> = {
    PRINTS: data.period_most_prints,
    SUCCESSFUL: data.period_most_successful_prints,
    FAILED: data.period_most_failed_prints,
  };

  return (
    <div>
      <div className="mx-14 mt-8 mb-2 flex flex-wrap items-center gap-6">
        <h2 className="flex items-center gap-2 text-4xl font-futura text-balance">
          <TrophyIcon className="size-8" />
          3DP rep approval stats.
        </h2>
        <div className="ml-auto w-full max-w-sm">
          <UserSearch placeholder="Search rep" requireRep selected={rep} onSelect={setRep} />
        </div>
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
              All-Time Approvals for {subject}:
            </CardHeader>
            <CardContent>
              <Stat label="Prints approved" value={stats.total_prints} />
              <Stat label="Successful" value={stats.total_successful_prints} />
              <Stat label="Failed" value={stats.total_failed_prints} />
              <Stat label="Success rate" value={rate(stats.total_successful_prints, stats.total_prints)} />
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
                {subject}'s Approvals for {academicLabel(year)}:
              </span>
              <AcademicYearPicker year={year} onYearChange={setYear} />
            </CardHeader>
            <CardContent>
              <Stat label="Prints approved" value={stats.period_prints} />
              <Stat label="Successful" value={stats.period_successful_prints} />
              <Stat label="Failed" value={stats.period_failed_prints} />
              <Stat label="Success rate" value={rate(stats.period_successful_prints, stats.period_prints)} />
            </CardContent>
          </div>
        </Card>
      </div>

      <div className="mx-8 mb-4 flex items-center justify-end">
        <Select value={metric} onValueChange={(value) => setMetric(value as Metric)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(METRIC_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative flex flex-col sm:flex-row gap-8 mb-8 px-8">
        <Leaderboard title={`${METRIC_LABELS[metric]}: all time`} ranking={total_ranking[metric]} />
        <Leaderboard title={`${METRIC_LABELS[metric]}: ${academicLabel(year)}`} ranking={period_ranking[metric]} />
      </div>
    </div>
  );
}
