import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import Loader from "./components/loader";
import "./index.css";
 import { useUser } from "@/hooks/useUser";
import { AuthProvider } from "@/providers/AuthProvider";
import { routeTree } from "@/routeTree.gen";
import { Toaster } from "@packages/ui/components/sonner";
import { TooltipProvider } from "@packages/ui/components/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ORPCContext, orpc, queryClient as orpcQueryClient } from "./utils/orpc";
import "jotai-devtools/styles.css";
import { SidebarProvider } from "@packages/ui/components/sidebar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GenericError } from "./components/routing/GenericError";
import { Loading } from "./components/routing/Loading";
import { NotFound } from "./components/routing/NotFound";

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
    defaultPendingComponent: Loading,

    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ORPCContext.Provider value={orpc}>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <DndProvider backend={HTML5Backend}>
              <SidebarProvider>
                <TooltipProvider>
                  <AuthProvider>{children}</AuthProvider>
                </TooltipProvider>
              </SidebarProvider>
            </DndProvider>
          </ThemeProvider>
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
