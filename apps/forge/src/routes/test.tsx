import { createFileRoute } from '@tanstack/react-router'
import { Input } from '@ui/components/ui/input'
import { Label } from '@ui/components/ui/label'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Label>
    Text
  </Label>
}
