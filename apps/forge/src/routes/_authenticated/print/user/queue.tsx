import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/print/user/queue')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/print/personal/queue"!</div>
}
