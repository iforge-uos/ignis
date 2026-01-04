import { Forbidden } from "@/components/routing/Forbidden";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin")({
  component: () => {
    const { user } = Route.useRouteContext();
    if (!user.roles.find((role) => role.name === "Admin")) {
      return <Forbidden />;
    }
    return <Outlet />;
  },
});
