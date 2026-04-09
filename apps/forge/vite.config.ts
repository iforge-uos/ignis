import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { createLogger, defineConfig } from "vite-plus";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import lqip from "vite-plugin-lqip";
import svgr from "vite-plugin-svgr";
import ws from "./ws";

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
  oxc: {
    target: "es2024",
  },
  resolve: {
    // This enables built-in support for path aliases defined in tsconfig.json
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart(),
    react({
      babel: {
        plugins: [
          "babel-plugin-react-compiler", // must run first!
        ],
      },
    }),
    tailwindcss(),
    {
      name: "orpc-websocket-dev",
      configureServer() {
        if (process.env.NODE_ENV === "development") {
          Bun.serve({
            port: 3001,
            ...ws,
          });
        }
      },
    },
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
    // ...(process.env.NODE_ENV === "development" ? [spotlight({ anchor: "bottomLeft" }), spotlightSidecar()] : []),
    sentryVitePlugin({
      org: "iforge-uos",
      project: "forge",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    visualizer({
      open: true,
      filename: "dist/stats.html",
      gzipSize: true,
    }),
    // compression({ algorithms: ["zstandard"], deleteOriginalAssets: false }),
  ],
  customLogger: logger,
});

export default config;
