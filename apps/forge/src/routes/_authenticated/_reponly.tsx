// src/routes/_authenticated.tsx
import { Forbidden } from "@/components/routing/Forbidden";
import { createFileRoute, redirect } from "@tanstack/react-router";

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
    if (!context.auth.user.roles.find((role) => role.name === "Rep")) {
      return <Forbidden />;
    }
  },
});
