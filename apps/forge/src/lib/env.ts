import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export default createEnv({
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

    // Google OAuth Configuration
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CLIENT_CALLBACK_URL: z.url(),
    GOOGLE_SERVICE_ACCOUNT_EMAIL: z.email(),
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().min(1),

    // Discord OAuth Configuration
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    DISCORD_CLIENT_CALLBACK_URL: z.url(),

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
    LDAP_DEFAULT_ATTRIBUTES: z
      .string()
      .default("")
      .transform((str) =>
        str
          .split(",")
          .map((attr) => attr.trim())
          .filter(Boolean),
      ),
    LDAP_SSL: z.coerce.boolean().default(false),

    // Email Configuration
    EMAIL_HOST: z.string().min(1),
    EMAIL_PORT: z.coerce.number().int().positive(),
    EMAIL_USER: z.string().min(1),
    EMAIL_PASS: z.string().min(1),
    EMAIL_FROM: z.email(),
    EMAIL_LOCAL_DOMAIN: z.string().min(1),
    EMAIL_SMTP_REQUIRE_TLS: z.coerce.boolean().default(true),
    EMAIL_RATE_MAX: z.coerce.number().int().positive(),
    EMAIL_RATE_DURATION: z.coerce.number().int().positive(),

    // CDN Configuration
    CDN_URL: z.url(),

    // Frontend Configuration
    FRONT_END_URL: z.url(),

    // Logging Configuration
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    SENTRY_AUTH_TOKEN: z.string().min(1),

    // Database Configuration
    INFRACTIONS_WEBHOOK_URL: z.url(),
  },
  clientPrefix: "VITE_",
  client: {
    // VITE_API_URL: z.url(),
    // VITE_CDN_URL: z.url(),
    // VITE_SENTRY_DSN: z.url(),
    // VITE_SENTRY_ORG: z.string().min(1),
    // VITE_SENTRY_PROJECT: z.string().min(1),
  },
  runtimeEnv: process.env,
  createFinalSchema: (shape) =>
    z.object(shape).transform((env) => ({
      auth: {
        csrfSecret: env.CSRF_SECRET,
        csrfExcludeRoutes: env.CSRF_EXCLUDE_ROUTES,
        adminRole: env.ADMIN_ROLE,
        repRole: [], // This was hardcoded as empty array in the original
        jwtSecret: env.JWT_SECRET,
      },
      oauth: {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackUrl: env.GOOGLE_CLIENT_CALLBACK_URL,
          serviceAccount: {
            email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            privateKey: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
          },
        },
        discord: {
          clientId: env.DISCORD_CLIENT_ID,
          clientSecret: env.DISCORD_CLIENT_SECRET,
          callbackUrl: env.DISCORD_CLIENT_CALLBACK_URL,
        },
      },
      redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        db: env.REDIS_DB,
        password: env.REDIS_PASSWORD,
      },
      ldap: {
        host: env.LDAP_HOST,
        port: env.LDAP_PORT,
        base: env.LDAP_BASE,
        user: env.LDAP_USER,
        pass: env.LDAP_PASS,
        defaultAttributes: env.LDAP_DEFAULT_ATTRIBUTES,
        ssl: env.LDAP_SSL,
      },
      email: {
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
      },
      cdn: {
        url: env.CDN_URL,
      },
      frontend: {
        url: env.FRONT_END_URL,
      },
      logging: {
        level: env.LOG_LEVEL,
        sentry: {
          authToken: env.SENTRY_AUTH_TOKEN,
        },
      },
      db: {
        globals: {
          INFRACTIONS_WEBHOOK_URL: env.INFRACTIONS_WEBHOOK_URL,
        },
      },
    //   client: {
    //     apiUrl: env.VITE_API_URL,
    //     cdnUrl: env.VITE_CDN_URL,
    //     sentryDsn: env.VITE_SENTRY_DSN,
    //     sentryOrg: env.VITE_SENTRY_ORG,
    //     sentryProject: env.VITE_SENTRY_PROJECT,
    //   },
    })),
});
