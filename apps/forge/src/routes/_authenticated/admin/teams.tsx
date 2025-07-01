

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/teams')({
  component: () => <div>Hello /_authenticated/admin/teams!</div>
})