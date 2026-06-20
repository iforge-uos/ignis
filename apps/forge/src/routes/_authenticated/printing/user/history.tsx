import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/printing/user/history")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/print/personal/history"!</div>;
}
