import { LoggingConfig } from "@/types/config.types";
import { getEnvVariable } from "@/utils/config.utils";
import Logger from "@/utils/logger.utils";

export const getLoggingConfig = (): LoggingConfig => ({
  level: getEnvVariable("LOG_LEVEL", "info"),
  logger: Logger,
});
