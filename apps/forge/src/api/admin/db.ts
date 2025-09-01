import { logger } from "@sentry/tanstackstart-react";
import { $ } from "bun";
import { admin } from "@/orpc";

export const getGelUI = admin.route({ path: "/db/ui" }).handler(async () => {
  logger.info("Retrieving Gel UI URL");

  const url = await $`gel ui --print-url -I ignis`.text();
  return url.match(/authToken=(.*)/)?.[1]!;
});
