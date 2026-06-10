import { Forbidden } from "@/components/routing/Forbidden";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_3dponly")({
  component: () => {
    const { user } = Route.useRouteContext();
    if (user?.__typename === "users::Rep") return <Forbidden />;
    if (!user.teams.find((teams) => teams.name === "3DP")) {
      return <Forbidden />;
    }
    return <Outlet />;
  },
});

