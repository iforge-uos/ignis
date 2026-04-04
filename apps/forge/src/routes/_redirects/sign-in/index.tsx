import { createFileRoute, redirect } from "@tanstack/react-router";
import { getActiveLocation } from "/src/lib/utils/sign-in";

export const Route = createFileRoute("/_redirects/sign-in/")({
  beforeLoad: () => {
    throw redirect({
      to: "/sign-in/$location",
      params: { location: getActiveLocation() },
    });
  },
});
