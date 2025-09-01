import type { SecureServerOptions } from "node:http2";
import { wrapVinxiConfigWithSentry } from "@sentry/tanstackstart-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import spotlightSidecar from "@spotlightjs/sidecar/vite-plugin";
import spotlight from "@spotlightjs/spotlight/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { createLogger, defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import lqip from "vite-plugin-lqip";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import env from "@/lib/env";

const logger = createLogger();
const loggerWarn = logger.warn;

logger.warn = (msg, options) => {
  // Ignore public files warning, it's stupid cause this is the only way to have things work with react-svg and lqip
  if (msg.includes("public directory")) return;
  loggerWarn(msg, options);
};

const config = defineConfig({
  build: {
    sourcemap: true,
    target: "esnext",
  },
  plugins: [
    tsconfigPaths(),
    tanstackStart({ customViteReactPlugin: true }),
    react(),
    tailwindcss(),
    lqip(),
    svgr({
      svgrOptions: {
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
        svgoConfig: {
          floatPrecision: 2,
        },
      },
    }),
    ViteImageOptimizer(),
    ...(process.env.NODE_ENV === "development" ? [spotlight({ anchor: "bottomLeft" }), spotlightSidecar()] : []),
    sentryVitePlugin({
      org: "iforge-uos",
      project: "forge",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    visualizer({
      open: true,
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  customLogger: logger,
});

export default wrapVinxiConfigWithSentry(config, {
  org: "iforge-uos",
  project: "forge",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Only print logs for uploading source maps in CI
  // Set to `true` to suppress logs
  silent: !process.env.CI,
});
