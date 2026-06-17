import { Temporal } from "@js-temporal/polyfill";
import e from "@packages/db/edgeql-js";
import * as z from "zod";
import db from "@/db";

const statFields = {
  total_print_time: z.number(),
  total_print_mass: z.number(),
  total_print_jobs: z.number(),
  total_successful_jobs: z.number(),
  total_failed_jobs: z.number(),
  total_downtime: z.number(),
  period_start: z.date(),
  period_end: z.date(),
  period_time: z.number(),
  period_print_time: z.number(),
  period_print_time_percent: z.number(),
  period_print_mass: z.number(),
  period_print_jobs: z.number(),
  period_successful_jobs: z.number(),
  period_failed_jobs: z.number(),
  period_downtime: z.number(),
  period_downtime_percent: z.number(),
  average_attempts: z.number(),
};

const totalStatsSchema = z.object(statFields);
const printerStatsSchema = z.object({ ...statFields, id: z.uuid(), name: z.string() });
export const historyStatsSchema = z.object({
  total: totalStatsSchema,
  printers: z.array(printerStatsSchema),
});

type totalHistoryStats = z.infer<typeof totalStatsSchema>;
type printerHistoryStats = z.infer<typeof printerStatsSchema>;
type historyStats = z.infer<typeof historyStatsSchema>;

const COMPLETE = "printing::print_status::Complete";
const FAILED = "printing::print_status::Failed";

export async function getHistoryStats(start_date: Date, end_date: Date = new Date()): Promise<historyStats> {
  const now = Date.now();
  const start_ms = start_date.getTime();
  const end_ms = end_date.getTime();

  const rows = await e
    .select(e.printing.Printer, (printer) => ({
      id: true,
      name: true,
      total_print_mass: true,
      total_print_time: true,
      histories: e.select(printer["<printer[is printing::PrintHistory]"], (h) => ({
        created_at: true,
        attempts: true,
        status_name: h.status.__type__.name,
        prints: e.select(h["<on[is printing::Print]"], () => ({
          duration: true,
          mass: true,
        })),
      })),
      downtimes: e.select(printer.downtimes, () => ({
        start_time: true,
        end_time: true,
        created_at: true,
      })),
    }))
    .run(db);

  const period_time = Math.max(0, (end_ms - start_ms) / 1000);
  const pct = (value: number, span: number) => (span > 0 ? (value / span) * 100 : 0);
  const seconds = (d: Temporal.Duration) => d.total({ unit: "seconds" });
  const in_window = (t: Temporal.ZonedDateTime) => t.epochMilliseconds >= start_ms && t.epochMilliseconds <= end_ms;
  const downtime_seconds = (
    d: { start_time: Temporal.ZonedDateTime; end_time: Temporal.ZonedDateTime | null },
    open_end: number,
  ) => ((d.end_time?.epochMilliseconds ?? open_end) - d.start_time.epochMilliseconds) / 1000;

  const printers: printerHistoryStats[] = rows.map((r) => {
    const period_histories = r.histories.filter((h) => in_window(h.created_at));
    const complete_in_period = period_histories.filter((h) => h.status_name === COMPLETE);
    const total_print_jobs = r.histories.length;
    const total_attempts = r.histories.reduce((acc, h) => acc + h.attempts, 0);
    const period_print_time = complete_in_period.reduce(
      (acc, h) => acc + h.prints.reduce((a, p) => a + seconds(p.duration), 0),
      0,
    );
    const period_print_mass = complete_in_period.reduce((acc, h) => acc + h.prints.reduce((a, p) => a + p.mass, 0), 0);
    const total_downtime = r.downtimes.reduce((acc, d) => acc + downtime_seconds(d, now), 0);
    const period_downtime = r.downtimes
      .filter((d) => in_window(d.created_at))
      .reduce((acc, d) => acc + downtime_seconds(d, end_ms), 0);

    return {
      id: r.id,
      name: r.name,
      total_print_time: seconds(r.total_print_time),
      total_print_mass: r.total_print_mass,
      total_print_jobs,
      total_successful_jobs: r.histories.filter((h) => h.status_name === COMPLETE).length,
      total_failed_jobs: r.histories.filter((h) => h.status_name === FAILED).length,
      total_downtime,
      period_start: start_date,
      period_end: end_date,
      period_time,
      period_print_time,
      period_print_time_percent: pct(period_print_time, period_time),
      period_print_mass,
      period_print_jobs: period_histories.length,
      period_successful_jobs: complete_in_period.length,
      period_failed_jobs: period_histories.filter((h) => h.status_name === FAILED).length,
      period_downtime,
      period_downtime_percent: pct(period_downtime, period_time),
      average_attempts: total_print_jobs > 0 ? total_attempts / total_print_jobs : 0,
    };
  });

  const sum = (key: keyof totalHistoryStats) => printers.reduce((acc, p) => acc + (p[key] as number), 0);
  const fleet_span = period_time * printers.length;
  const total_print_jobs = sum("total_print_jobs");
  const total_attempts = printers.reduce((acc, p) => acc + p.average_attempts * p.total_print_jobs, 0);
  const period_print_time = sum("period_print_time");
  const period_downtime = sum("period_downtime");

  const total: totalHistoryStats = {
    total_print_time: sum("total_print_time"),
    total_print_mass: sum("total_print_mass"),
    total_print_jobs,
    total_successful_jobs: sum("total_successful_jobs"),
    total_failed_jobs: sum("total_failed_jobs"),
    total_downtime: sum("total_downtime"),
    period_start: start_date,
    period_end: end_date,
    period_time,
    period_print_time,
    period_print_time_percent: pct(period_print_time, fleet_span),
    period_print_mass: sum("period_print_mass"),
    period_print_jobs: sum("period_print_jobs"),
    period_successful_jobs: sum("period_successful_jobs"),
    period_failed_jobs: sum("period_failed_jobs"),
    period_downtime,
    period_downtime_percent: pct(period_downtime, fleet_span),
    average_attempts: total_print_jobs > 0 ? total_attempts / total_print_jobs : 0,
  };

  return { total, printers };
}

const repStatsSchema = z.object({
  id: z.uuid(),
  firstname: z.string(),
  lastname: z.string(),
  total_prints: z.number(),
  total_successful_prints: z.number(),
  total_failed_prints: z.number(),
  total_success_rate: z.number(),
  period_start: z.date(),
  period_end: z.date(),
  period_prints: z.number(),
  period_successful_prints: z.number(),
  period_failed_prints: z.number(),
  period_success_rate: z.number(),
});

const rankingSchema = z.array(z.object({ firstname: z.string(), lastname: z.string(), score: z.number() }));

export const repOverallSchema = z.object({
  rep_stats: z.array(repStatsSchema),
  total_most_prints: rankingSchema,
  total_most_successful_prints: rankingSchema,
  total_most_failed_prints: rankingSchema,
  period_start: z.date(),
  period_end: z.date(),
  period_most_prints: rankingSchema,
  period_most_successful_prints: rankingSchema,
  period_most_failed_prints: rankingSchema,
});

type repStats = z.infer<typeof repStatsSchema>;
type repRanking = z.infer<typeof rankingSchema>[number];
type repOverallStats = z.infer<typeof repOverallSchema>;

export async function getRepStats(start_date: Date, end_date: Date = new Date()): Promise<repOverallStats> {
  const start_ms = start_date.getTime();
  const end_ms = end_date.getTime();

  const reps = await e
    .select(e.users.Rep, (rep) => ({
      id: true,
      first_name: true,
      last_name: true,
      histories: e.select(rep["<author[is printing::Print]"].on, (h) => ({
        created_at: true,
        status_name: h.status.__type__.name,
      })),
    }))
    .run(db);

  const in_window = (t: Temporal.ZonedDateTime) => t.epochMilliseconds >= start_ms && t.epochMilliseconds <= end_ms;
  const rate = (success: number, total: number) => (total > 0 ? (success / total) * 100 : 0);

  const rep_stats: repStats[] = reps.map((r) => {
    const period_histories = r.histories.filter((h) => in_window(h.created_at));
    const total_prints = r.histories.length;
    const total_successful = r.histories.filter((h) => h.status_name === COMPLETE).length;
    const total_failed = r.histories.filter((h) => h.status_name === FAILED).length;
    const period_prints = period_histories.length;
    const period_successful = period_histories.filter((h) => h.status_name === COMPLETE).length;
    const period_failed = period_histories.filter((h) => h.status_name === FAILED).length;

    return {
      id: r.id,
      firstname: r.first_name,
      lastname: r.last_name ?? "",
      total_prints,
      total_successful_prints: total_successful,
      total_failed_prints: total_failed,
      total_success_rate: rate(total_successful, total_prints),
      period_start: start_date,
      period_end: end_date,
      period_prints,
      period_successful_prints: period_successful,
      period_failed_prints: period_failed,
      period_success_rate: rate(period_successful, period_prints),
    };
  });

  const rank_by = (selector: (s: repStats) => number): repRanking[] =>
    [...rep_stats]
      .sort((a, b) => selector(b) - selector(a))
      .map((s) => ({ firstname: s.firstname, lastname: s.lastname, score: selector(s) }));

  return {
    rep_stats,
    total_most_prints: rank_by((s) => s.total_prints),
    total_most_successful_prints: rank_by((s) => s.total_successful_prints),
    total_most_failed_prints: rank_by((s) => s.total_failed_prints),
    period_start: start_date,
    period_end: end_date,
    period_most_prints: rank_by((s) => s.period_prints),
    period_most_successful_prints: rank_by((s) => s.period_successful_prints),
    period_most_failed_prints: rank_by((s) => s.period_failed_prints),
  };
}
