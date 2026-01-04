// src/routes/_authenticated.tsx
import { Forbidden } from "@/components/routing/Forbidden";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_reponly")({
  component: () => {
    const { user } = Route.useRouteContext();
    if (!user.roles.find((role) => role.name === "Rep")) {
      return <Forbidden />;
    }
    return <Outlet />;
  },
});
