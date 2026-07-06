import * as z from "zod";
import { getUserStats, userStatsSchema } from "@/lib/printers/history-stats";
import { auth } from "@/orpc";
import { prints } from "./prints";

export const stats = auth
  .route({ method: "GET", path: "/" })
  .input(
    z
      .object({
        start_time: z.iso.datetime().optional(),
        end_time: z.iso.datetime().optional(),
      })
      .default({}),
  )
  .output(userStatsSchema)
  .handler(async ({ input: { start_time, end_time }, context: { user } }) => {
    return getUserStats(
      user.id,
      start_time ? new Date(start_time) : undefined,
      end_time ? new Date(end_time) : undefined,
    );
  });

export const usersRoute = auth.prefix("/users").router({
  stats,
  prints,
});
