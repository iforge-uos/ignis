import { createFileRoute } from '@tanstack/react-router'
import { Input } from '@ui/components/ui/input'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Input></Input>
}
