import * as Sentry from "@sentry/tanstackstart-react";

// Sentry log levels that don't have a matching console method.
const CONSOLE_METHOD = {
  trace: "debug",
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error",
  fatal: "error",
} as const;

Sentry.init({
  dsn: "https://893631a88ccccc18a9b65d8b5c3e1395@o4507082090414080.ingest.de.sentry.io/4508127275122768",
  environment: process.env.NODE_ENV ? process.env.NODE_ENV : "development",
  tracesSampleRate: (process.env.NODE_ENV || "development") === "development" ? 1 : 0.1,
  sendDefaultPii: false,
  enableLogs: true,
  // Mirror `logger.*` calls to stdout so they also show up in pm2 logs.
  // Don't pair this with `consoleLoggingIntegration`, or every log would loop back into Sentry.
  beforeSendLog(log) {
    const { level, message, attributes } = log;
    const method = CONSOLE_METHOD[level] ?? "log";
    const userAttributes = Object.fromEntries(
      Object.entries(attributes ?? {}).filter(([key]) => !key.startsWith("sentry.")),
    );
    const args: unknown[] = [`[${level}]`, String(message)];
    if (Object.keys(userAttributes).length) args.push(userAttributes);
    console[method](...args);
    return log;
  },
});
