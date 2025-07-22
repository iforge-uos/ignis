import { RouteUnfinished } from "@/components/routing/RouteUnfinished";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/locations")({
  component: RouteUnfinished,
});

// TODO the floor plans etc
