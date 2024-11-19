import { AppSidebar } from "@/components/app-navigation";
import { SidebarHeader } from "@/components/app-navigation/sidebar-header";
import CommandMenu from "@/components/command-menu";
import { TailwindIndicator } from "@/components/dev/Tailwind-Indicator.tsx";
import { Footer } from "@/components/footer";
import { GenericError } from "@/components/routing/GenericError.tsx";
import { Loading } from "@/components/routing/Loading.tsx";
import { NotFound } from "@/components/routing/NotFound.tsx";
import UCardReader from "@/components/ucard-reader";
import { useUser } from "@/lib/utils.ts";
import { SidebarInset, SidebarProvider } from "@ignis/ui/components/ui/sidebar";
import { QueryClient } from "@tanstack/react-query";
import { Outlet, ScrollRestoration, createRootRouteWithContext } from "@tanstack/react-router";
import React, { Suspense } from "react";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

export function RootComponentInner({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TailwindIndicator />
      <ScrollRestoration />
      <UCardReader />
      {children}
      <Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
    </>
  );
}

function RootComponent() {
  return (
    <>
      <CommandMenu />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <div className="sticky top-0 z-50 bg-background">
            <SidebarHeader />
          </div>
          <div className="flex-grow">
            <div className="h-fit min-h-screen pt-4">
              <RootComponentInner>
                <Outlet />
              </RootComponentInner>
            </div>
            <Footer />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export interface ForgeRouterContext {
  user: ReturnType<typeof useUser>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<ForgeRouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: GenericError,
  pendingComponent: Loading,
});
