import { createFileRoute } from "@tanstack/react-router"
import { RouteUnfinished } from "@/components/routing/RouteUnfinished";
import { } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  component: () => RouteUnfinished,
});
