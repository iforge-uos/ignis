import "@/index.css";
import { GenericError } from "@/components/routing/GenericError";
import { Loading } from "@/components/routing/Loading";
import { NotFound } from "@/components/routing/NotFound";
import { useUser } from "@/lib/utils";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/themeProvider";
import { routeTree } from "@/routeTree.gen";
import { ForgeRouterContext } from "@/routes/__root";
import type { ORPCRouter } from "@ignis/types/orpc";
import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Toaster } from "@ui/components/ui/sonner";
import { TooltipProvider } from "@ui/components/ui/tooltip";
import { DevTools } from "jotai-devtools";
import "jotai-devtools/styles.css";
import { queryClientAtom } from "jotai-tanstack-query";
import { useHydrateAtoms } from "jotai/react/utils";
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { ORPCContext } from "./providers/orpcProvider";

// Begin Router
const queryClient = new QueryClient();

const link = new RPCLink({
  url: "http://localhost:3000/rpc",
});

const HydrateAtoms = ({ children }: { children: React.ReactNode }) => {
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return children;
};

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    user: undefined!,
    orpc: undefined!,
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
    routeContext: ForgeRouterContext;
  }
}

function App() {
  const user = useUser();
  const [client] = useState<ORPCRouter>(() => createORPCClient(link));
  const [orpc] = useState(() => createORPCReactQueryUtils(client));

  return (
    <ORPCContext.Provider value={orpc}>
      <RouterProvider
        router={router}
        context={{
          queryClient,
          user,
          orpc,
        }}
      />
    </ORPCContext.Provider>
  );
}

declare global {
  interface Date {
    toTemporalInstant(): Temporal.Instant;
  }
}

Date.prototype.toTemporalInstant = toTemporalInstant;

Sentry.init({
  dsn: "https://893631a88ccccc18a9b65d8b5c3e1395@o4507082090414080.ingest.de.sentry.io/4508127275122768",
  integrations: [Sentry.browserTracingIntegration()],
  // @ts-ignore its find and replaced
  tracesSampleRate: '%MODE%' === "development" ? 1.0 : 0.1,
  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/api.iforge.sheffield.ac.uk/],
  sendDefaultPii: false,
});

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <HydrateAtoms>
          <HelmetProvider>
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
              <DndProvider backend={HTML5Backend}>
                <TooltipProvider>
                  <AuthProvider>
                    <DevTools position="bottom-right" />
                    <App />
                    <Toaster richColors />
                  </AuthProvider>
                </TooltipProvider>
              </DndProvider>
            </ThemeProvider>
          </HelmetProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </HydrateAtoms>
      </QueryClientProvider>
    </React.StrictMode>,
  );
} else {
  console.error("Root element not found");
}
