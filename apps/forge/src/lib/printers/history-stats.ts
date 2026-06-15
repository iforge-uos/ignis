import db from '@/db';
import { Temporal } from "@js-temporal/polyfill";
import e from "@packages/db/edgeql-js";

interface totalHistoryStats {
    total_print_time: number,
    total_print_mass: number,
    total_print_jobs: number,
    total_successful_jobs: number,
    total_failed_jobs: number,
    total_downtime: number,
    period_start: Date,
    period_end: Date,
    period_time: number,
    period_print_time: number,
    period_print_time_percent: number,
    period_print_mass: number;
    period_print_jobs: number,
    period_successful_jobs: number,
    period_failed_jobs: number,
    period_downtime: number,
    period_downtime_percent: number,
    average_attempts: number,
}

interface printerHistoryStats extends totalHistoryStats {
    id: string,
    name: string
}

type historyStats = {
    total: totalHistoryStats,
    printers: printerHistoryStats[]
}

const COMPLETE = "printing::print_status::Complete";
const FAILED = "printing::print_status::Failed";

export async function getHistoryStats(start_date: Date, end_date: Date = new Date()): Promise<historyStats> {
    const now = Date.now();
    const startMs = start_date.getTime();
    const endMs = end_date.getTime();

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

    const period_time = Math.max(0, (endMs - startMs) / 1000);
    const pct = (value: number, span: number) => (span > 0 ? (value / span) * 100 : 0);
    const seconds = (d: Temporal.Duration) => d.total({ unit: "seconds" });
    const inWindow = (t: Temporal.ZonedDateTime) => t.epochMilliseconds >= startMs && t.epochMilliseconds <= endMs;
    const downtimeSeconds = (
        d: { start_time: Temporal.ZonedDateTime; end_time: Temporal.ZonedDateTime | null },
        openEnd: number,
    ) => ((d.end_time?.epochMilliseconds ?? openEnd) - d.start_time.epochMilliseconds) / 1000;

    const printers: printerHistoryStats[] = rows.map((r) => {
        const periodHistories = r.histories.filter((h) => inWindow(h.created_at));
        const completeInPeriod = periodHistories.filter((h) => h.status_name === COMPLETE);
        const total_print_jobs = r.histories.length;
        const total_attempts = r.histories.reduce((acc, h) => acc + h.attempts, 0);
        const period_print_time = completeInPeriod.reduce(
            (acc, h) => acc + h.prints.reduce((a, p) => a + seconds(p.duration), 0), 0,
        );
        const period_print_mass = completeInPeriod.reduce(
            (acc, h) => acc + h.prints.reduce((a, p) => a + p.mass, 0), 0,
        );
        const total_downtime = r.downtimes.reduce((acc, d) => acc + downtimeSeconds(d, now), 0);
        const period_downtime = r.downtimes
            .filter((d) => inWindow(d.created_at))
            .reduce((acc, d) => acc + downtimeSeconds(d, endMs), 0);

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
            period_print_jobs: periodHistories.length,
            period_successful_jobs: completeInPeriod.length,
            period_failed_jobs: periodHistories.filter((h) => h.status_name === FAILED).length,
            period_downtime,
            period_downtime_percent: pct(period_downtime, period_time),
            average_attempts: total_print_jobs > 0 ? total_attempts / total_print_jobs : 0,
        };
    });

    const sum = (key: keyof totalHistoryStats) =>
        printers.reduce((acc, p) => acc + (p[key] as number), 0);
    const fleetSpan = period_time * printers.length;
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
        period_print_time_percent: pct(period_print_time, fleetSpan),
        period_print_mass: sum("period_print_mass"),
        period_print_jobs: sum("period_print_jobs"),
        period_successful_jobs: sum("period_successful_jobs"),
        period_failed_jobs: sum("period_failed_jobs"),
        period_downtime,
        period_downtime_percent: pct(period_downtime, fleetSpan),
        average_attempts: total_print_jobs > 0 ? total_attempts / total_print_jobs : 0,
    };

    return { total, printers };
}

interface repStats {
    id: string,
    firstname: string,
    lastname: string,
    total_prints: number,
    total_successful_prints:number
    total_failed_prints: number,
    total_success_rate: number,
    period_start: Date,
    period_end: Date,
    period_prints: number,
    period_successful_prints:number
    period_failed_prints: number,
    period_success_rate: number,
}

interface repRanking {
    firstname: string,
    lastname: string,
    score: number,
}

interface repOverallStats {
    rep_stats: repStats[],
    total_most_prints: repRanking[],
    total_most_successful_prints: repRanking[],
    total_most_failed_prints: repRanking[],
    period_start: Date,
    period_end: Date,
    period_most_prints: repRanking[],
    period_most_successful_prints: repRanking[],
    period_most_failed_prints: repRanking[],
}

export async function getRepStats(start_date: Date, end_date: Date = new Date()): Promise<repOverallStats> {
    const startMs = start_date.getTime();
    const endMs = end_date.getTime();

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

    const inWindow = (t: Temporal.ZonedDateTime) => t.epochMilliseconds >= startMs && t.epochMilliseconds <= endMs;
    const rate = (success: number, total: number) => (total > 0 ? (success / total) * 100 : 0);

    const rep_stats: repStats[] = reps.map((r) => {
        const periodHistories = r.histories.filter((h) => inWindow(h.created_at));
        const total_prints = r.histories.length;
        const total_successful = r.histories.filter((h) => h.status_name === COMPLETE).length;
        const total_failed = r.histories.filter((h) => h.status_name === FAILED).length;
        const period_prints = periodHistories.length;
        const period_successful = periodHistories.filter((h) => h.status_name === COMPLETE).length;
        const period_failed = periodHistories.filter((h) => h.status_name === FAILED).length;

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

    const rankBy = (selector: (s: repStats) => number): repRanking[] =>
        [...rep_stats]
            .sort((a, b) => selector(b) - selector(a))
            .map((s) => ({ firstname: s.firstname, lastname: s.lastname, score: selector(s) }));

    return {
        rep_stats,
        total_most_prints: rankBy((s) => s.total_prints),
        total_most_successful_prints: rankBy((s) => s.total_successful_prints),
        total_most_failed_prints: rankBy((s) => s.total_failed_prints),
        period_start: start_date,
        period_end: end_date,
        period_most_prints: rankBy((s) => s.period_prints),
        period_most_successful_prints: rankBy((s) => s.period_successful_prints),
        period_most_failed_prints: rankBy((s) => s.period_failed_prints),
    };
}
