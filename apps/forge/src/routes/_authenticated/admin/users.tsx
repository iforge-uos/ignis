import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: () => <div>Hello /_authenticated/admin/users!</div>,
});
