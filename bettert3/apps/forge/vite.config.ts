import { sentryVitePlugin } from "@sentry/vite-plugin";
import spotlightSidecar from "@spotlightjs/sidecar/vite-plugin";
import spotlight from "@spotlightjs/spotlight/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json", "../../packages/ui/tsconfig.json"],
    }),
    tanstackStart(),
    tailwindcss(),
    ViteImageOptimizer(),
    spotlight(),
    spotlightSidecar(),
    sentryVitePlugin({
      org: "iforge-uos",
      project: "anvil",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
