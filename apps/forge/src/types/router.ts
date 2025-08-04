import type { router } from "@/routes/api.$";
import type { InferRouterOutputs } from "@orpc/server";
import { type RegisteredRouter, type RouteIds, type RoutePaths, useNavigate } from "@tanstack/react-router";

export type _RoutePaths = Parameters<ReturnType<typeof useNavigate>>[0]["to"]

export type RoutePath = RoutePaths<RegisteredRouter["routeTree"]>;
export type RouteId = RouteIds<RegisteredRouter["routeTree"]>;

export type Procedures = InferRouterOutputs<typeof router>
