import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_3dponly/print/_3dpadminonly/edit/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/_3dponly/print/_3dpadminonly/edit/"!</div>;
}
