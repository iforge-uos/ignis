import { createFileRoute } from "@tanstack/react-router";
import Title from "@/components/title";
import { orpc } from "@/lib/orpc";
import { ensureQueryData } from "@/lib/query-utils";
import RepNotice from "./-components/RepNotice";

function RouteComponent() {
  const tools = Route.useLoaderData();
  return (
    <>
      <Title prompt="Tools" />
      <div className="p-6">
        <div>Hello "/tools/"!</div>
        {tools.map((tool) => tool.name)}
        <RepNotice />
      </div>
    </>
  );
}

export const Route = createFileRoute("/tools/")({
  // TODO make this auto add the footer to all child routes
  component: RouteComponent,
  loader: async ({ context }) => await ensureQueryData(
    context.queryClient,
    orpc.tools.all.queryOptions(),
  ),
});
