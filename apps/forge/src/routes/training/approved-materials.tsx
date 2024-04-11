import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/training/approved-materials')({
  component: () => <div>Hello /training/approved-materials!</div>
})