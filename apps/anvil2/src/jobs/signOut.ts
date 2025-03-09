import { CronJob } from "cron";
import { Express } from "express";

export function setupSignOutCronJob(app: Express) {
  // Run at 12:00 AM (midnight) every day
  const signOutJob = new CronJob("0 0 * * *", async () => {});

  // Start the cron job
  signOutJob.start();
}
