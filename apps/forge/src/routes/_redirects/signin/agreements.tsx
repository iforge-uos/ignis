import { redirect, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_redirects/signin/agreements")({
  loader: () =>
    redirect({
      to: "/user/agreements",
      throw: true,
    }),
});
