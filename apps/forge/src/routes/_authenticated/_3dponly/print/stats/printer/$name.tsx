import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

export const Route = createFileRoute("/_authenticated/_3dponly/print/stats/printer/$name")({
  component: RouteComponent,
  params: z.object({ name: z.string().min(1) }),
});

function RouteComponent() {
  return <div>Hello "/_authenticated/_3dponly/print/stats/printer/$name"!</div>;
}
