import "@/index.css";
import { GenericError } from "@/components/routing/GenericError";
import { Loading } from "@/components/routing/Loading";
import { NotFound } from "@/components/routing/NotFound";
import { useUser } from "@/lib/utils.ts";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/themeProvider";
import { routeTree } from "@/routeTree.gen.ts";
import { Apps } from "@/types/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Toaster } from "@ui/components/ui/sonner.tsx";
import { DevTools } from "jotai-devtools";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "jotai-devtools/styles.css";
import { ForgeRouterContext } from "@/routes/__root.tsx";
import { TooltipProvider } from "@ui/components/ui/tooltip";
import { queryClientAtom } from "jotai-tanstack-query";
import { useHydrateAtoms } from "jotai/react/utils";

// Begin Router
const queryClient = new QueryClient();

const HydrateAtoms = ({ children }: { children: React.ReactNode }) => {
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return children;
};

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    user: undefined!,
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
  interface StaticDataRouteOption {
    title?: Apps;
  }
}

function App() {
  const user = useUser();

  return (
    <RouterProvider
      router={router}
      context={{
        queryClient,
        user,
      }}
    />
  );
}

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
