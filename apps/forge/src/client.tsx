import * as Sentry from "@sentry/tanstackstart-react";
import { StartClient } from '@tanstack/react-start/client'
import React from "react";
import { hydrateRoot } from "react-dom/client";
import env from "@/lib/env";
import "./polyfill";

Sentry.init({
  dsn: "https://893631a88ccccc18a9b65d8b5c3e1395@o4507082090414080.ingest.de.sentry.io/4508127275122768",
  // dsn: config.client.sentryDsn,
  tunnel: "/api/sentry-tunnel",
  environment: import.meta.env.DEV ? "development" : "production",
  integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router), Sentry.replayIntegration()],
  tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    "localhost",
    // new RegExp(RegExp.escape(`^${env.client.apiUrl}`)),
  ],
  sendDefaultPii: false,
});

// only load Spotlight in dev
if (import.meta.env.DEV) {
  import("@spotlightjs/spotlight").then(({ init }) => init({ anchor: "bottomLeft", openOnInit: false }));
}
hydrateRoot(
  document,
  <React.StrictMode>
    <StartClient />
  </React.StrictMode>,
);
