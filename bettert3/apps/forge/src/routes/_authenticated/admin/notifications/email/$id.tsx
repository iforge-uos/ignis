import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/notifications/email/$id")({
  component: () => <div>Hello /_authenticated/admin/notifications/email/$id!</div>,
});
