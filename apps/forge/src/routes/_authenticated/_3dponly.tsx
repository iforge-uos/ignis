import { Forbidden } from "@/components/routing/Forbidden";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_3dponly")({
  component: () => {
    const { user } = Route.useRouteContext();
    if (!user) return <Forbidden />;
    const inTeam = user.__typename === "users::Rep" && user.teams.some((t) => t.name === "3DP");
    const hasRole = user.roles.some((r) => r.name === "Admin");
    if (!(inTeam || hasRole)) {
      return <Forbidden />;
    }
    return <Outlet />;
  },
});

