import { AuthContext } from "@/components/auth-provider";
import CommandMenu from "@/components/command-menu";
import { TailwindIndicator } from "@/components/dev/Tailwind-Indicator.tsx";
import NavBar from "@/components/navbar";
import { GenericError } from "@/components/routing/GenericError.tsx";
import { Loading } from "@/components/routing/Loading.tsx";
import { NotFound } from "@/components/routing/NotFound.tsx";
import UCardReader from "@/components/ucard-reader";
import { QueryClient } from "@tanstack/react-query";
import { Outlet, ScrollRestoration, createRootRouteWithContext } from "@tanstack/react-router";
import React, { Suspense } from "react";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

function RootComponent() {
  return (
    <>
      <NavBar />
      <TailwindIndicator />
      <ScrollRestoration />
      <CommandMenu />
      <UCardReader />
      <Outlet /> {/* This is where child routes will render */}
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
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
