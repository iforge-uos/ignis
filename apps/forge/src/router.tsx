import "./index.css";
import { orpc, queryClient as orpcQueryClient } from "@/lib/orpc";
// import { AuthProvider } from "@/providers/AuthProvider";
import { routeTree } from "@/routeTree.gen";
import { TooltipProvider } from "@packages/ui/components/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Hammer } from "@/components/loading";
import { GenericError } from "@/components/routing/GenericError";
import { NotFound } from "@/components/routing/NotFound";
import { ORPCContext } from "@/hooks/useORPC";

const queryClient = orpcQueryClient;

export const createRouter = () => {
  const router = createTanstackRouter({
    routeTree,
    scrollRestoration: true,
    context: { orpc, queryClient, user: undefined! },
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
              {children}
              {/* </AuthProvider> */}
            </TooltipProvider>
          </DndProvider>
        </ORPCContext.Provider>
      </QueryClientProvider>
    ),
  });
  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
