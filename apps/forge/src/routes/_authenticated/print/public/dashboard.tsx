import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/print/public/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/print/personal/public/dashboard"!</div>;
}
