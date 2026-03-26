import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/locations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <></>
}
