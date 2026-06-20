import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/printing/tips")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/printing/tips"!</div>;
}
