import { redirect, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_redirects/signin/agreements")({
  loader: () =>
    redirect({
      to: "/sign-in/agreements",
      throw: true,
    }),
});
