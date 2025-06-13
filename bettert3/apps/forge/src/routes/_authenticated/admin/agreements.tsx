

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/agreements')({
  component: () => <div>Hello /_authenticated/admin/agreements!</div>
})