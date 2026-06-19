import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/print/public/printer/$name")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/print/personal/public/printer/$name"!</div>;
}
