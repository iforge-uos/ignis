import * as z from "zod";
import { getHistoryStats, historyStatsSchema } from "@/lib/printers/history-stats";
import { auth, printing } from "@/orpc";
import { printer } from "./$name";
import { print } from "./print.$id";
import { competition } from "./reps";
import { timelapseRouter } from "./timelapse";
import { user } from "./user.$id";

export const stats = printing
  .route({ method: "GET", path: "/" })
  .input(
    z.object({
      start_time: z.iso.datetime(),
      end_time: z.iso.datetime().optional(),
    }),
  )
  .output(historyStatsSchema)
  .handler(async ({ input: { start_time, end_time } }) =>
    getHistoryStats(new Date(start_time), end_time ? new Date(end_time) : undefined),
  );

export const historyRouter = auth.prefix("/history").router({
  user,
  competition,
  stats,
  printer,
  print,
  ...timelapseRouter,
});
