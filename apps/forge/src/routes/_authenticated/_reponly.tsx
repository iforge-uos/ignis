// src/routes/_authenticated.tsx
import { Forbidden } from "@/components/routing/Forbidden";
import { useUser } from "@/lib/utils";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import {NotFound} from "@/components/routing/NotFound.tsx";

export const Route = createFileRoute("/_authenticated/_reponly")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  notFoundComponent: NotFound,
  component: () => {
    if (!useUser()!.roles.find((role) => role.name === "Rep")) {
      return <Forbidden />;
    }
    return <Outlet />;
  },
});
