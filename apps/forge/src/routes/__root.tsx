import type { AuthContext } from "@/components/auth-provider";
import CommandMenu from "@/components/command-menu";
import { TailwindIndicator } from "@/components/dev/Tailwind-Indicator.tsx";
import NavBar from "@/components/navbar";
import { GenericError } from "@/components/routing/GenericError.tsx";
import { Loading } from "@/components/routing/Loading.tsx";
import { NotFound } from "@/components/routing/NotFound.tsx";
import UCardReader from "@/components/ucard-reader";
import type { QueryClient } from "@tanstack/react-query";
import {
	Outlet,
	ScrollRestoration,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import React, {Suspense, useEffect} from "react";
import { z } from "zod";

const rootSearchSchema = z.object({
	uwu: z.boolean().optional(),
});

const TanStackRouterDevtools =
	process.env.NODE_ENV === "production"
		? () => null // Render nothing in production
		: React.lazy(() =>
				// Lazy load in development
				import("@tanstack/router-devtools").then((res) => ({
					default: res.TanStackRouterDevtools,
				})),
			);

export function RootComponentInner({
									   children,
								   }: {
	children: React.ReactNode;
}) {
	const search = Route.useSearch()

	useEffect(() => {
		if (search.uwu !== undefined) {
			localStorage.setItem("uwu", search.uwu.toString());
		}
	}, [search.uwu]);

	return (
		<>
			<NavBar />
			<TailwindIndicator />
			<ScrollRestoration />
			<CommandMenu />
			<UCardReader />
			{children} {/* This is where child routes will render */}
			<Suspense>
				<TanStackRouterDevtools />
			</Suspense>
		</>
	);
}

function RootComponent() {
	return (
		<RootComponentInner>
			<Outlet />
		</RootComponentInner>
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
	validateSearch: (search) => rootSearchSchema.parse(search),
});
