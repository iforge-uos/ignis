import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Forbidden } from "@/components/routing/Forbidden";

export const Route = createFileRoute("/_authenticated/_3dponly")({
  component: () => {
    const { user } = Route.useRouteContext();
    if (!user) return <Forbidden />;
    const in_team = user.__typename === "users::Rep" && user.teams.some((t) => t.name === "3DP");
    const has_role = user.roles.some((r) => r.name === "Admin");
    if (!(in_team || has_role)) {
      return <Forbidden />;
    }
    return <Outlet />;
  },
});
