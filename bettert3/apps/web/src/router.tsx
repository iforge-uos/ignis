import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import Loader from "./components/loader";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ORPCContext,
  orpc,
  queryClient as orpcQueryClient,
} from "./utils/orpc";
import { useUser } from "@/lib/utils";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/themeProvider";
import { routeTree } from "@/routeTree.gen";
import { Toaster } from "@ui/components/ui/sonner";
import { TooltipProvider } from "@ui/components/ui/tooltip";
import "jotai-devtools/styles.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
const queryClient = orpcQueryClient;

export const createRouter = () => {
  const router = createTanstackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: { orpc, queryClient, user: undefined! },
    defaultPendingComponent: () => <Loader />,
    defaultNotFoundComponent: () => <div>Not Found</div>,
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ORPCContext.Provider value={orpc}>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <DndProvider backend={HTML5Backend}>
              <TooltipProvider>
                <AuthProvider>{children}</AuthProvider>
              </TooltipProvider>
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
