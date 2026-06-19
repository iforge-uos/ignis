import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_3dpuploadonly/print")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/_3dpuploadonly/printing"!</div>;
}
