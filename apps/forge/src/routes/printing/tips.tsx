import { createFileRoute } from "@tanstack/react-router";
import { RouteUnfinished } from "@/components/routing/RouteUnfinished";

export const Route = createFileRoute("/printing/tips")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RouteUnfinished />;
}
