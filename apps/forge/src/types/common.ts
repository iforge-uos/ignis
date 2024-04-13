import { RoutePaths } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen.ts";

export const RESET_APP = "RESET_APP";

export type appRoutes = RoutePaths<typeof routeTree>;
