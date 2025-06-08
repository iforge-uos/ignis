import { getEnvVariable } from "@/utils/config";
import { DBConfig } from "./types";

export const getDBConfig = (): DBConfig => ({
  globals: { INFRACTIONS_WEBHOOK_URL: getEnvVariable("INFRACTIONS_WEBHOOK_URL") },
});
