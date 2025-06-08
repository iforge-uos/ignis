import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://2e7344bf16e964653bb52d2b33209495@o4507082090414080.ingest.de.sentry.io/4507090730483792",
  tracesSampleRate: (process.env.NODE_ENV || "development") === "development" ? 1 : 0.1,
  sendDefaultPii: false,
});
