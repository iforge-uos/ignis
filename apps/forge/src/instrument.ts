import * as Sentry from "@sentry/bun";

Sentry.init({
  dsn: "https://893631a88ccccc18a9b65d8b5c3e1395@o4507082090414080.ingest.de.sentry.io/4508127275122768",
  environment: process.env.NODE_ENV ? process.env.NODE_ENV : "development",
  tracesSampleRate: (process.env.NODE_ENV || "development") === "development" ? 1 : 0.1,
  sendDefaultPii: false,
  _experiments: {
    enableLogs: true,
  },
});
