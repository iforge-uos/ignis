import { auth, printing } from "@/orpc";
import * as z from "zod";
import { getHistoryStats } from "@/lib/printers/history-stats";
import { printer } from "./$name";
import { user } from "./user.$id";
import { print } from "./print.$id"
import { competition } from "./reps";

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

const statsOutput = z.object({
    total: z.object(statFields),
    printers: z.array(z.object({ ...statFields, id: z.uuid(), name: z.string() })),
});

export const stats = printing
    .route({ method: "GET", path: "/" })
    .input(z.object({
        start_time: z.iso.datetime(),
        end_time: z.iso.datetime().optional(),
    }))
    .output(statsOutput)
    .handler(async ({ input: { start_time, end_time } }) =>
        getHistoryStats(new Date(start_time), end_time ? new Date(end_time) : undefined),
    );

export const historyRouter = auth.prefix("/history").router({
    user,
    competition,
    stats,
    printer,
    print,
});