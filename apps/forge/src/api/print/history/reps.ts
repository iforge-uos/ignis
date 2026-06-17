import * as z from "zod";
import { getRepStats, repOverallSchema } from "@/lib/printers/history-stats";
import { printing } from "@/orpc";

export const competition = printing
  .route({ method: "GET", path: "/reps" })
  .input(
    z.object({
      start_time: z.iso.datetime(),
      end_time: z.iso.datetime().optional(),
    }),
  )
  .output(repOverallSchema)
  .handler(async ({ input: { start_time, end_time } }) =>
    getRepStats(new Date(start_time), end_time ? new Date(end_time) : undefined),
  );
