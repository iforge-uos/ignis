import { createFileRoute } from "@tanstack/react-router";
import { RouteUnfinished } from "@/components/routing/RouteUnfinished.tsx";

export const Route = createFileRoute("/socials/")({
  component: RouteUnfinished,
});
