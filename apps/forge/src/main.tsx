import "@/index.css";
import { ThemeProvider } from "@/providers/themeProvider";
import { persistor, store } from "@/redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";

import { AuthProvider, useAuth } from "@/components/auth-provider";
import { Loading } from "@/components/routing/Loading.tsx";
import { routeTree } from "@/routeTree.gen.ts";
import { Toaster } from "@ui/components/ui/sonner.tsx";
import posthog from "posthog-js";
import { PersistGate } from "redux-persist/integration/react";
import UCardReader from "./components/ucard-reader";

// Begin Router
const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined!,
  },
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  posthog.init("phc_XIzxR3RXcdmcyMPJCCnQFtxoL0gRshzEXo4kM925LvA", { api_host: "https://web-mkc4o00.sampiiiii.dev" });
  return <RouterProvider router={router} context={{ auth }} />;
}

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Provider store={store}>
              <PersistGate loading={<Loading />} persistor={persistor}>
                <AuthProvider>
                  <InnerApp />
                  <Toaster />
                  <UCardReader />
                </AuthProvider>
              </PersistGate>
            </Provider>
          </ThemeProvider>
        </HelmetProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
} else {
  console.error("Root element not found");
}
