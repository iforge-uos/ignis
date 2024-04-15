import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_reponly/signin/actions/")({
  beforeLoad: () => {
    throw redirect({
      to: "/signin/",
    });
  },
});
