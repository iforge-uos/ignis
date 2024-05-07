import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/notifications/dashboard")({
  component: () => <div>Hello /_authenticated/admin/notifications/dashboard!</div>,
});
