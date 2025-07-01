import { sentryVitePlugin } from "@sentry/vite-plugin";
import spotlightSidecar from "@spotlightjs/sidecar/vite-plugin";
import spotlight from "@spotlightjs/spotlight/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    sourcemap: true,
    target: "esnext",
  },
  plugins: [
    react(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json", "../../packages/ui/tsconfig.json"],
    }),
    tanstackStart(),
    tailwindcss(),
    ViteImageOptimizer(),
    ...(process.env.NODE_ENV === "development" ? [spotlight(), spotlightSidecar()] : []),
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
