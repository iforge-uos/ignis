import { Hammer } from "@/components/loading";
import { GenericError } from "@/components/routing/GenericError";
import { NotFound } from "@/components/routing/NotFound";
import { ORPCContext } from "@/hooks/useORPC";
import { orpc } from "@/lib/orpc";
import "./index.css";
import { StandardRPCJsonSerializer } from "@orpc/client/standard";
import { TooltipProvider } from "@packages/ui/components/tooltip";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { Provider as JotaiProvider } from "jotai";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
// import { AuthProvider } from "@/providers/AuthProvider";
import serialisers from "@/lib/serialisers";
import { routeTree } from "@/routeTree.gen";
import { ORPCError } from "@orpc/client";
import * as Sentry from "@sentry/tanstackstart-react";

const serializer = new StandardRPCJsonSerializer({
  customJsonSerializers: serialisers,
});

export const getRouter = () => {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSuccess(_data, _variables, _onMutateResult, mutation, _context) {
        // [ [ "todo", "create" ], { "type": "mutation" } ]
        const key = mutation.options.mutationKey;
        if (!key) return; // if there is no mutation key, we won't invalidate anything
        // [ [ [ "todo", "getAll" ], { "type": "query" } ] ]
        for (const query of queryClient.getQueryCache().getAll()) {
          // Invalidate queries that share any segment with the mutation key
          const hasOverlap = query.queryKey.some((segment) => key.includes(segment));
          if (hasOverlap) {
            queryClient.invalidateQueries({ queryKey: query.queryKey });
          }
        }
      },
    }),
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof ORPCError) {
          if (error.status === 401) {
            // Unauthorized error, don't show a toast
            return;
          }
        }
        toast.error(`Error: ${error.message}`, {
          action: {
            label: "retry",
            onClick: () => {
              queryClient.invalidateQueries();
            },
          },
        });
        console.error(error)
        Sentry.captureException(error)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000, // > 0 to prevent immediate refetching on mount
      },

      dehydrate: {
        serializeData(data) {
          const [json, meta] = serializer.serialize(data);
          return { json, meta };
        },
      },
      hydrate: {
        deserializeData(data) {
          return serializer.deserialize(data.json, data.meta);
        },
      },
    },
  });

  const router = createTanstackRouter({
    routeTree,
    scrollRestoration: true,
    context: {
      queryClient,
      user: null,
    },
    // serializationAdapters: tanstackSerialisers,
    defaultPreload: "intent",
    // Since we're using React Query, we don't want loader calls to ever be stale
    // This will ensure that the loader is always called when the route is preloaded or visited
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: GenericError,
    defaultPendingComponent: Hammer,

    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ORPCContext.Provider value={orpc}>
          <DndProvider backend={HTML5Backend}>
            <TooltipProvider>
              <JotaiProvider>{children}</JotaiProvider>
              {/* </AuthProvider> */}
            </TooltipProvider>
          </DndProvider>
        </ORPCContext.Provider>
      </QueryClientProvider>
    ),
  });
  if (!router.isServer) {
    Sentry.init({
      dsn: "https://893631a88ccccc18a9b65d8b5c3e1395@o4507082090414080.ingest.de.sentry.io/4508127275122768",
      // dsn: config.client.sentryDsn,
      tunnel: "/api/sentry-tunnel",
      environment: import.meta.env.DEV ? "development" : "production",
      // integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router), Sentry.replayIntegration()],
      tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: [
        "localhost",
        // new RegExp(RegExp.escape(`^${env.client.apiUrl}`)),
      ],
      sendDefaultPii: false,
      integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router), Sentry.replayIntegration()],
      // Enable logs to be sent to Sentry
      enableLogs: true,
    });
  }

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
