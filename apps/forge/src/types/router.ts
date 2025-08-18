import type { router } from "@/routes/api/$";
import type { InferRouterOutputs } from "@orpc/server";
import { type RegisteredRouter, type RouteIds } from "@tanstack/react-router";
import {type RoutePaths } from "@tanstack/router-core"

export type RoutePath = RoutePaths<RegisteredRouter["routeTree"]>;
export type RouteId = RouteIds<RegisteredRouter["routeTree"]>;

export type Procedures = InferRouterOutputs<typeof router>
