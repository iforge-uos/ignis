import {
    createRootRouteWithContext,
    Outlet,
    ScrollRestoration,
    useNavigate,
} from "@tanstack/react-router";
import {QueryClient} from "@tanstack/react-query";
import NavBar from "@/components/navbar";
import CommandMenu from "@/components/command-menu";
import React, {Suspense} from "react";
import {AuthContext} from "@/components/auth-provider";
import Title from "@/components/title";
import { Button } from "@ui/components/ui/button";

const TanStackRouterDevtools =
    process.env.NODE_ENV === 'production'
        ? () => null // Render nothing in production
        : React.lazy(() =>
            // Lazy load in development
            import('@tanstack/router-devtools').then((res) => ({
                default: res.TanStackRouterDevtools,
            })),
        )

function RootComponent() {
    return (
        <>
            <NavBar/>
            <ScrollRestoration/>
            <CommandMenu/>
            <Outlet/> {/* This is where child routes will render */}
            <Suspense>
                <TanStackRouterDevtools/>
            </Suspense>
        </>
    );
}

function NotFoundComponent() {
    const navigate = useNavigate();
    return (
        <>
            <RootComponent/>
            <Title prompt="Not Found" />
            <div className="flex items-center justify-center w-full min-h-[80vh] px-4">
            <div className="grid items-center gap-4 text-center">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl">404 - Page Not Found</h1>
                    <p className="max-w-[600px] mx-auto text-accent-foreground md:text-xl/relaxed">
                        Oops! The page you are looking for does not exist or is under construction.
                    </p>
                    <p className="text-sm text-accent-foreground">
                        Note: This site is still under development. For assistance, join our <a className="text-primary" href={import.meta.env.VITE_DISCORD_URL}>Discord server</a>.
                    </p>
                </div>
                <div className="flex justify-center">
                    <Button variant="outline" onClick={() => {navigate({to: "/"})}}>Go to Homepage</Button>
                </div>
            </div>
            </div>
        </>
      )
}


export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
    auth: AuthContext;
}>()({
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
});
