import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_3dponly/print/_3dpadminonly/downtime")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/_3dponly/print/_3dpadminonly/downtime"!</div>;
}
