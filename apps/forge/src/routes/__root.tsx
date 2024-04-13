import { createRootRouteWithContext, Outlet, ScrollRestoration } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import NavBar from "@/components/navbar";
import CommandMenu from "@/components/command-menu";
import React, { Suspense } from "react";
import { AuthContext } from "@/components/auth-provider";
import { NotFound } from "@/components/routing/NotFound.tsx";
import { GenericError } from "@/components/routing/GenericError.tsx";

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
      <ScrollRestoration />
      <CommandMenu />
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
});
