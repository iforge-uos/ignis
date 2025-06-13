

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/notifications/app/')({
  component: () => <div>Hello /_authenticated/admin/notifications/app/!</div>
})