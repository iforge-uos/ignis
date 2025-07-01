import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/notifications/app/$id')({
  component: () => <div>Hello /_authenticated/admin/notifications/app/$id!</div>,
});
