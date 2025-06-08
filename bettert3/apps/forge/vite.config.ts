import { wrapVinxiConfigWithSentry } from "@sentry/tanstackstart-react";
// import spotlight from "@spotlightjs/spotlight/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  tsr: {
    appDirectory: "src",
  },
  vite: {
    plugins: [
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      spotlight(),
      tailwindcss(),
      ViteImageOptimizer(),
      visualizer({
        gzipSize: true,
        brotliSize: true,
      }),
    ],
  },
});

export default wrapVinxiConfigWithSentry(config, {
  org: "iforge-uos",
  project: "forge",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Only print logs for uploading source maps in CI
  // Set to `true` to suppress logs
  silent: !process.env.CI,
});
