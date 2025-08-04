import "./instrument";
import "./global-middleware";
import "./polyfill";
import * as Sentry from "@sentry/tanstackstart-react";
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { createRouter } from "./router";

export default createStartHandler({
  createRouter,
})(Sentry.wrapStreamHandlerWithSentry(defaultStreamHandler));
