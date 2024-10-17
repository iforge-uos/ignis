import dotenv from "dotenv";
import path from "node:path";
import { AppConfig } from "@/types/config.types";
import { getLdapConfig } from "@/config/ldap.config";
import { getGoogleConfig } from "@/config/google.config";
import { getDiscordConfig } from "@/config/discord.config";
import { getAuthConfig } from "@/config/auth.config";
import { getEmailConfig } from "@/config/email.config";
import { getRedisConfig } from "@/config/redis.config";
import { getCdnConfig } from "@/config/cdn.config";
import { getFrontendConfig } from "@/config/frontend.config";
import { getLoggingConfig } from "@/config/logger.config";

// Load the appropriate .env file based on the NODE_ENV
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`),
});

const config: AppConfig = {
  ldap: getLdapConfig(),
  google: getGoogleConfig(),
  discord: getDiscordConfig(),
  auth: getAuthConfig(),
  email: getEmailConfig(),
  redis: getRedisConfig(),
  cdn: getCdnConfig(),
  frontend: getFrontendConfig(),
  logging: getLoggingConfig(),
};

export default config;
