import { Hammer } from "@/components/loading";
import { GenericError } from "@/components/routing/GenericError";
import { NotFound } from "@/components/routing/NotFound";
import { ORPCContext } from "@/hooks/useORPC";
import { orpc } from "@/lib/orpc";
import "./index.css";
import { StandardRPCJsonSerializer } from "@orpc/client/standard";
import { TooltipProvider } from "@packages/ui/components/tooltip";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { Provider as JotaiProvider } from "jotai";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
// import { AuthProvider } from "@/providers/AuthProvider";
import serialisers from "@/lib/serialisers";
import { routeTree } from "@/routeTree.gen";

const serializer = new StandardRPCJsonSerializer({
  customJsonSerializers: serialisers,
});

export const getRouter = () => {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        toast.error(`Error: ${error.message}`, {
          action: {
            label: "retry",
            onClick: () => {
              queryClient.invalidateQueries();
            },
          },
        });
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
