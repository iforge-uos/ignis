import path from "node:path";
import { getCdnConfig } from "@/config/cdn.config";
import { getEmailConfig } from "@/config/email.config";
import { getFrontendConfig } from "@/config/frontend.config";
import { getLdapConfig } from "@/config/ldap.config";
import { getLoggingConfig } from "@/config/logger.config";
import { getRedisConfig } from "@/config/redis.config";
import dotenv from "dotenv";
import { getAuthConfig } from "./auth.config";
import { getDBConfig } from "./db.config";
import { AppConfig } from "./types";

// Load the appropriate .env file based on the NODE_ENV
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`),
});

const config: AppConfig = {
  db: getDBConfig(),
  ldap: getLdapConfig(),
  auth: getAuthConfig(),
  email: getEmailConfig(),
  redis: getRedisConfig(),
  cdn: getCdnConfig(),
  frontend: getFrontendConfig(),
  logging: getLoggingConfig(),
};

export default config;
