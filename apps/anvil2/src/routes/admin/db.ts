import { exec } from "node:child_process";
import { admin } from "@/router";
import Logger from "@/utils/logger";

export const getGelUI = admin.route({ path: "/admin/db/ui" }).handler(async () => {
  Logger.info("Retrieving Gel UI URL");

  const url = await new Promise<string>((resolve, reject) => {
    exec("gel ui --print-url", (error, stdout, stderr) => {
      if (error) {
        Logger.error(`Error executing gel ui command: ${error.message}`);
        reject(error);
        return;
      }

      if (stderr) {
        Logger.warn(`Command stderr: ${stderr}`);
      }

      return resolve(stdout.trim());
    });
  });

  return url.match(/authToken=(.*)/)?.[1]!;
});

export const dbRouter = admin.router({
  getGelUI,
});
