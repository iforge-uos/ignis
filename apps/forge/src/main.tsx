import "@/index.css";
import { ThemeProvider } from "@/providers/themeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import { routeTree } from "@/routeTree.gen.ts";
import { Toaster } from "@ui/components/ui/sonner.tsx";
import React from "react";
import { GenericError } from "@/components/routing/GenericError";
import { Loading } from "@/components/routing/Loading";
import { NotFound } from "@/components/routing/NotFound";
import { Apps } from "@/types/app";
import { AuthProvider } from "@/providers/AuthProvider";
import {useUser} from "@/lib/utils.ts";

import { DevTools } from 'jotai-devtools'
import 'jotai-devtools/styles.css'

// Begin Router
const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    user: undefined!
  },
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: GenericError,
  defaultPendingComponent: Loading,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface StaticDataRouteOption {
    title?: Apps;
  }
}

function InnerApp() {
  return <RouterProvider router={router} context={{ user: useUser() }} />;
}

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <AuthProvider>
                  <DevTools />
                  <InnerApp />
                  <Toaster />
                </AuthProvider>
          </ThemeProvider>
        </HelmetProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
} else {
  console.error("Root element not found");
}
