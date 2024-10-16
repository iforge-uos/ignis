import { LoggingConfig } from "@/types/config.types";
import { getEnvVariable } from "@/utils/config.utils";

export const getLoggingConfig = (): LoggingConfig => ({
  level: getEnvVariable("LOG_LEVEL"),
});
