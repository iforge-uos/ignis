import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: () => <div>Hello /_authenticated/admin/!</div>,
});
