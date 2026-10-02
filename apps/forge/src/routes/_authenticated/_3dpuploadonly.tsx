import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Forbidden } from "@/components/routing/Forbidden";

export const Route = createFileRoute("/_authenticated/_3dpuploadonly")({
  component: () => {
    const { user } = Route.useRouteContext();
    if (!user) return <Forbidden />;
    const roles = ["Admin", "Rep", "Printa"];
    if (!user.roles.some((r) => roles.includes(r.name))) {
      return <Forbidden />;
    }
    return <Outlet />;
  },
});
