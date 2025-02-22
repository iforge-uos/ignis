import path from "node:path";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    ViteImageOptimizer(),
    visualizer({
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@dbschema": path.resolve(__dirname, "../anvil/dbschema/"),
      "@ui": path.resolve(__dirname, "../../packages/ui"),
      "@ui/components": path.resolve(__dirname, "../../packages/ui/components/ui"),
      "@ui/components/ui/": path.resolve(__dirname, "../../packages/ui/components/ui"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@ui/*", "@ui/components/*"],
  },
  server: {
    proxy: {
      "/api/*": "http://localhost:8000",
    },
    host: "0.0.0.0",
    port: 8000,
  },
});
