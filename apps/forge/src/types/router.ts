import { RegisteredRouter, RouteIds, RoutePaths } from "@tanstack/react-router";

export type RoutePath = RoutePaths<RegisteredRouter["routeTree"]>;
export type RouteId = RouteIds<RegisteredRouter["routeTree"]>;
