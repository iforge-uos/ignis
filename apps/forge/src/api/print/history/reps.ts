import * as z from "zod";
import { getRepStats } from "@/lib/printers/history-stats";
import { printing } from "@/orpc";

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

const ranking = z.array(
  z.object({
    firstname: z.string(),
    lastname: z.string(),
    score: z.number(),
  }),
);

const repOverallOutput = z.object({
  rep_stats: z.array(repStatsSchema),
  total_most_prints: ranking,
  total_most_successful_prints: ranking,
  total_most_failed_prints: ranking,
  period_start: z.date(),
  period_end: z.date(),
  period_most_prints: ranking,
  period_most_successful_prints: ranking,
  period_most_failed_prints: ranking,
});

export const competition = printing
  .route({ method: "GET", path: "/reps" })
  .input(
    z.object({
      start_time: z.iso.datetime(),
      end_time: z.iso.datetime().optional(),
    }),
  )
  .output(repOverallOutput)
  .handler(async ({ input: { start_time, end_time } }) =>
    getRepStats(new Date(start_time), end_time ? new Date(end_time) : undefined),
  );
