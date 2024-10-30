import { AppSidebar } from "@/components/app-navigation";
import { AuthContext } from "@/components/auth-provider";
import CommandMenu from "@/components/command-menu";
import { TailwindIndicator } from "@/components/dev/Tailwind-Indicator.tsx";
import Footer from "@/components/footer";
import { GenericError } from "@/components/routing/GenericError.tsx";
import { Loading } from "@/components/routing/Loading.tsx";
import { NotFound } from "@/components/routing/NotFound.tsx";
import UCardReader from "@/components/ucard-reader";
import { QueryClient } from "@tanstack/react-query";
import { Outlet, ScrollRestoration, createRootRouteWithContext } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@ignis/ui/components/ui/sidebar";
import React, { Suspense } from "react";
import { SidebarHeader } from "@/components/app-navigation/sidebar-header";

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
        <TanStackRouterDevtools position={"bottom-right"} />
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
        <SidebarInset>
          <SidebarHeader />
          <RootComponentInner>
            <Outlet />
          </RootComponentInner>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  auth: AuthContext;
}>()({
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: GenericError,
  pendingComponent: Loading,
});
