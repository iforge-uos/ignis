// src/routes/_authenticated.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_reponly")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user?.roles.find((role) => role.name === "Rep")) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
