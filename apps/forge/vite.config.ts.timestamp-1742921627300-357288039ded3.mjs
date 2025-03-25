// vite.config.ts
import path from "node:path";
import { TanStackRouterVite } from "file:///Users/talentyolandandlovu/Documents/Cpp%20projects/ignis/node_modules/.pnpm/@tanstack+router-vite-plugin@1.81.9_vite@5.4.11_@types+node@22.9.0_terser@5.39.0__webpack@5.9_b2tlp2lzp2zn7umzvx5knfvmnm/node_modules/@tanstack/router-vite-plugin/dist/esm/index.js";
import react from "file:///Users/talentyolandandlovu/Documents/Cpp%20projects/ignis/node_modules/.pnpm/@vitejs+plugin-react-swc@3.7.1_@swc+helpers@0.5.13_vite@5.4.11_@types+node@22.9.0_terser@5.39.0_/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { visualizer } from "file:///Users/talentyolandandlovu/Documents/Cpp%20projects/ignis/node_modules/.pnpm/rollup-plugin-visualizer@5.12.0_rollup@4.27.2/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { defineConfig } from "file:///Users/talentyolandandlovu/Documents/Cpp%20projects/ignis/node_modules/.pnpm/vite@5.4.11_@types+node@22.9.0_terser@5.39.0/node_modules/vite/dist/node/index.js";
import { ViteImageOptimizer } from "file:///Users/talentyolandandlovu/Documents/Cpp%20projects/ignis/node_modules/.pnpm/vite-plugin-image-optimizer@1.1.8_vite@5.4.11_@types+node@22.9.0_terser@5.39.0_/node_modules/vite-plugin-image-optimizer/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/talentyolandandlovu/Documents/Cpp projects/ignis/apps/forge";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    ViteImageOptimizer(),
    visualizer({
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@dbschema": path.resolve(__vite_injected_original_dirname, "../anvil/dbschema/"),
      "@ui": path.resolve(__vite_injected_original_dirname, "../../packages/ui"),
      "@ui/components": path.resolve(__vite_injected_original_dirname, "../../packages/ui/components/ui"),
      "@ui/components/ui/": path.resolve(__vite_injected_original_dirname, "../../packages/ui/components/ui")
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@ui/*", "@ui/components/*"]
  },
  server: {
    proxy: {
      "/api/*": "http://localhost:8000"
    },
    host: "0.0.0.0",
    port: 8e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdGFsZW50eW9sYW5kYW5kbG92dS9Eb2N1bWVudHMvQ3BwIHByb2plY3RzL2lnbmlzL2FwcHMvZm9yZ2VcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy90YWxlbnR5b2xhbmRhbmRsb3Z1L0RvY3VtZW50cy9DcHAgcHJvamVjdHMvaWduaXMvYXBwcy9mb3JnZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvdGFsZW50eW9sYW5kYW5kbG92dS9Eb2N1bWVudHMvQ3BwJTIwcHJvamVjdHMvaWduaXMvYXBwcy9mb3JnZS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB7IFRhblN0YWNrUm91dGVyVml0ZSB9IGZyb20gXCJAdGFuc3RhY2svcm91dGVyLXZpdGUtcGx1Z2luXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyBWaXRlSW1hZ2VPcHRpbWl6ZXIgfSBmcm9tIFwidml0ZS1wbHVnaW4taW1hZ2Utb3B0aW1pemVyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIFRhblN0YWNrUm91dGVyVml0ZSgpLFxuICAgIFZpdGVJbWFnZU9wdGltaXplcigpLFxuICAgIHZpc3VhbGl6ZXIoe1xuICAgICAgZ3ppcFNpemU6IHRydWUsXG4gICAgICBicm90bGlTaXplOiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgXCJAZGJzY2hlbWFcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9hbnZpbC9kYnNjaGVtYS9cIiksXG4gICAgICBcIkB1aVwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL3BhY2thZ2VzL3VpXCIpLFxuICAgICAgXCJAdWkvY29tcG9uZW50c1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL3BhY2thZ2VzL3VpL2NvbXBvbmVudHMvdWlcIiksXG4gICAgICBcIkB1aS9jb21wb25lbnRzL3VpL1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL3BhY2thZ2VzL3VpL2NvbXBvbmVudHMvdWlcIiksXG4gICAgfSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIiwgXCJAdWkvKlwiLCBcIkB1aS9jb21wb25lbnRzLypcIl0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHByb3h5OiB7XG4gICAgICBcIi9hcGkvKlwiOiBcImh0dHA6Ly9sb2NhbGhvc3Q6ODAwMFwiLFxuICAgIH0sXG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXG4gICAgcG9ydDogODAwMCxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwWCxPQUFPLFVBQVU7QUFDM1ksU0FBUywwQkFBMEI7QUFDbkMsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsa0JBQWtCO0FBQzNCLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsMEJBQTBCO0FBTG5DLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLG1CQUFtQjtBQUFBLElBQ25CLG1CQUFtQjtBQUFBLElBQ25CLFdBQVc7QUFBQSxNQUNULFVBQVU7QUFBQSxNQUNWLFlBQVk7QUFBQSxJQUNkLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDcEMsYUFBYSxLQUFLLFFBQVEsa0NBQVcsb0JBQW9CO0FBQUEsTUFDekQsT0FBTyxLQUFLLFFBQVEsa0NBQVcsbUJBQW1CO0FBQUEsTUFDbEQsa0JBQWtCLEtBQUssUUFBUSxrQ0FBVyxpQ0FBaUM7QUFBQSxNQUMzRSxzQkFBc0IsS0FBSyxRQUFRLGtDQUFXLGlDQUFpQztBQUFBLElBQ2pGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLFNBQVMsYUFBYSxTQUFTLGtCQUFrQjtBQUFBLEVBQzdEO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxVQUFVO0FBQUEsSUFDWjtBQUFBLElBQ0EsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
