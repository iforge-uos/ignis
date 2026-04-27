import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_redirects/sign-in/agreements")({
  beforeLoad: () => {
    throw redirect({
        to: "/user/agreements"
    });
  },
});
