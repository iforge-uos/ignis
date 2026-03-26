import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test/graph')({
  component: RouteComponent,
})
// rednder this as a table, it should make things easier? https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table
// https://www.figma.com/design/Klo9W3Z32kMraVz1nIeQtX/Sign-In-Graphs?node-id=0-1&p=f
function RouteComponent() {
  return <div>Hello "/test/graph"!</div>
}
