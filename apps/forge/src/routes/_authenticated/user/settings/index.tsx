import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/user/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/user/settings/"!</div>
}
