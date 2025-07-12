import * as Sentry from "@sentry/tanstackstart-react";
import * as Spotlight from "@spotlightjs/spotlight";
import { StartClient } from "@tanstack/react-start";
import { hydrateRoot } from "react-dom/client";

import React from "react";
import { createRouter } from "./router";

const router = createRouter();

Sentry.init({
  dsn: "https://893631a88ccccc18a9b65d8b5c3e1395@o4507082090414080.ingest.de.sentry.io/4508127275122768",
  tunnel: "/api/sentry-tunnel",
  integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router), Sentry.replayIntegration()],
  tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/api.iforge.sheffield.ac.uk/],
  sendDefaultPii: false,
});

// only load Spotlight in dev
if (import.meta.env.DEV) {
  Spotlight.init();
}

hydrateRoot(
  document,
  <React.StrictMode>
    <StartClient router={router} />
  </React.StrictMode>,
);
