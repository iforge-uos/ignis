import {  redirect } from "@tanstack/react-router";

export const Route = createFileRoute({
  loader: () =>
    redirect({
      to: "/sign-in/agreements",
      throw: true,
    }),
});
