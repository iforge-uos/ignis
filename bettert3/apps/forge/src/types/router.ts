import { useNavigate, type RegisteredRouter, type RouteIds, type RoutePaths } from "@tanstack/react-router";

export type _RoutePaths = Parameters<ReturnType<typeof useNavigate>>[0]["to"]

export type RoutePath = RoutePaths<RegisteredRouter["routeTree"]>;
export type RouteId = RouteIds<RegisteredRouter["routeTree"]>;
