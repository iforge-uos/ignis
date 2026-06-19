import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_3dponly/print/queue/send/$name")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/_3dponly/print/queue/send/$name"!</div>;
}
