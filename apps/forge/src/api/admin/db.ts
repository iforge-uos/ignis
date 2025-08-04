import { exec } from "node:child_process";
import { admin } from "@/orpc";
import { logger } from "@sentry/tanstackstart-react";

export const getGelUI = admin.route({ path: "/db/ui" }).handler(async () => {
  logger.info("Retrieving Gel UI URL");

  const url = await new Promise<string>((resolve, reject) => {
    exec("gel ui --print-url", (error, stdout, stderr) => {
      if (error) {
        logger.error(`Error executing gel ui command: ${error.message}`);
        reject(error);
        return;
      }

      if (stderr) {
        logger.warn(`Command stderr: ${stderr}`);
      }

      return resolve(stdout.trim());
    });
  });

  return url.match(/authToken=(.*)/)?.[1]!;
});
