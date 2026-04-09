import * as Sentry from "@sentry/tanstackstart-react";
import { StartClient } from '@tanstack/react-start/client'
import React from "react";
import { hydrateRoot } from "react-dom/client";
import env from "@/lib/env";
import "./polyfill";

// only load Spotlight in dev
if (import.meta.env.DEV) {
  // import("@spotlightjs/spotlight").then(({ init }) => init({ anchor: "bottomLeft", openOnInit: false }));
}

hydrateRoot(
  document,
  <React.StrictMode>
    <StartClient />
  </React.StrictMode>,
);
