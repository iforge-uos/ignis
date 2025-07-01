

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/dashboard')({
  component: () => <div>Hello /_authenticated/admin/dashboard!</div>
})