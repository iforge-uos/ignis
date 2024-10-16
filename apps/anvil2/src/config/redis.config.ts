import { RedisConfig } from "@/types/config.types";
import { getEnvVariable, getEnvNumber } from "@/utils/config.utils";

export const getRedisConfig = (): RedisConfig => ({
  host: getEnvVariable("REDIS_HOST"),
  port: getEnvNumber("REDIS_PORT"),
  db: getEnvVariable("REDIS_DB"),
  password: getEnvVariable("REDIS_PASSWORD"),
});
