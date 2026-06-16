import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Forbidden } from "@/components/routing/Forbidden";

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
