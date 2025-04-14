import { LoggingConfig } from "./types";
import { getEnvVariable } from "@/utils/config";
import Logger from "@/utils/logger";

export const getLoggingConfig = (): LoggingConfig => ({
  level: getEnvVariable("LOG_LEVEL", "info"),
  logger: Logger,
});
