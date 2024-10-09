import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
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
