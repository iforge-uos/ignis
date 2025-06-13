import path from "node:path";
import { getCdnConfig } from "@/config/cdn";
import { getEmailConfig } from "@/config/email";
import { getFrontendConfig } from "@/config/frontend";
import { getLdapConfig } from "@/config/ldap";
import { getRedisConfig } from "@/config/redis";
import dotenv from "dotenv";
import { getAuthConfig } from "./auth";
import { getDBConfig } from "./db";
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
};

export default config;
