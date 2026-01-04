import type { InferRouterOutputs } from "@orpc/server";
import { type RegisteredRouter, type RouteIds } from "@tanstack/react-router";
import { type RoutePaths } from "@tanstack/router-core";
import type { Router } from "@/routes/api/$";

export type RoutePath = RoutePaths<RegisteredRouter["routeTree"]>;
export type RouteId = RouteIds<RegisteredRouter["routeTree"]>;

export type Procedures = InferRouterOutputs<Router>;
