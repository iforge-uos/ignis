import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/print/user/history")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/print/personal/history"!</div>;
}
