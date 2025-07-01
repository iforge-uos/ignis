import path from "node:path";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod/v4";

// Load the appropriate .env file based on the NODE_ENV
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`),
});

export const env = createEnv({
  server: {
    // Auth Configuration
    CSRF_SECRET: z.string().min(1),
    CSRF_EXCLUDE_ROUTES: z
      .string()
      .default("")
      .transform((str) =>
        str
          .split(",")
          .map((route) => route.trim())
          .filter(Boolean),
      ),
    ADMIN_ROLE: z.string().min(1),
    JWT_SECRET: z.string().min(1),

    // Redis Configuration
    REDIS_HOST: z.string().min(1),
    REDIS_PORT: z.coerce.number().int().positive(),
    REDIS_DB: z.string().min(1),
    REDIS_PASSWORD: z.string().min(1),

    // LDAP Configuration
    LDAP_HOST: z.string().min(1),
    LDAP_PORT: z.coerce.number().int().positive(),
    LDAP_BASE: z.string().min(1),
    LDAP_USER: z.string().min(1),
    LDAP_PASS: z.string().min(1),
    LDAP_DEFAULT_ATTRIBUTES: z.string().default(""),
    LDAP_SSL: z.coerce.boolean().default(false),

    // Email Configuration
    EMAIL_HOST: z.string().min(1),
    EMAIL_PORT: z.coerce.number().int().positive(),
    EMAIL_USER: z.string().min(1),
    EMAIL_PASS: z.string().min(1),
    EMAIL_FROM: z.string().email(),
    EMAIL_LOCAL_DOMAIN: z.string().min(1),
    EMAIL_SMTP_REQUIRE_TLS: z.coerce.boolean().default(true),
    EMAIL_RATE_MAX: z.coerce.number().int().positive(),
    EMAIL_RATE_DURATION: z.coerce.number().int().positive(),

    // CDN Configuration
    CDN_URL: z.string().url(),

    // Frontend Configuration
    FRONT_END_URL: z.string().url(),

    // Database Configuration
    INFRACTIONS_WEBHOOK_URL: z.string().url(),
  },
  runtimeEnv: process.env,
});

// Export typed configuration objects for backward compatibility
export const getAuthConfig = () => ({
  csrfSecret: env.CSRF_SECRET,
  csrfExcludeRoutes: env.CSRF_EXCLUDE_ROUTES,
  adminRole: env.ADMIN_ROLE,
  repRole: [], // This was hardcoded as empty array in the original
  jwtSecret: env.JWT_SECRET,
});

export const getRedisConfig = () => ({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
  password: env.REDIS_PASSWORD,
});

export const getLdapConfig = () => ({
  host: env.LDAP_HOST,
  port: env.LDAP_PORT,
  base: env.LDAP_BASE,
  user: env.LDAP_USER,
  pass: env.LDAP_PASS,
  defaultAttributes: env.LDAP_DEFAULT_ATTRIBUTES.split(",")
    .map((attr) => attr.trim())
    .filter(Boolean),
  ssl: env.LDAP_SSL,
});

export const getEmailConfig = () => ({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  from: env.EMAIL_FROM,
  localDomain: env.EMAIL_LOCAL_DOMAIN,
  smtpRequireTls: env.EMAIL_SMTP_REQUIRE_TLS,
  rateMax: env.EMAIL_RATE_MAX,
  rateDuration: env.EMAIL_RATE_DURATION,
});

export const getCdnConfig = () => ({
  url: env.CDN_URL,
});

export const getFrontendConfig = () => ({
  url: env.FRONT_END_URL,
});

export const getDBConfig = () => ({
  globals: {
    INFRACTIONS_WEBHOOK_URL: env.INFRACTIONS_WEBHOOK_URL,
  },
});

// Export the consolidated config object
export const config = {
  auth: getAuthConfig(),
  redis: getRedisConfig(),
  ldap: getLdapConfig(),
  email: getEmailConfig(),
  cdn: getCdnConfig(),
  frontend: getFrontendConfig(),
  db: getDBConfig(),
};

export default config;
