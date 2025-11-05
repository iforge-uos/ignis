import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/notifications/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/notifications/"!</div>
}
