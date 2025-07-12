import { sentryVitePlugin } from "@sentry/vite-plugin";
import spotlightSidecar from "@spotlightjs/sidecar/vite-plugin";
import spotlight from "@spotlightjs/spotlight/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import lqip from "vite-plugin-lqip";
import svgr from "vite-plugin-svgr";
import viteTsConfigPaths from "vite-tsconfig-paths";
console.log("In config");
export default defineConfig({
  build: {
    sourcemap: true,
    target: "esnext",
  },
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json", "../../packages/ui/tsconfig.json"],
    }),
    tanstackStart(),
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
});
