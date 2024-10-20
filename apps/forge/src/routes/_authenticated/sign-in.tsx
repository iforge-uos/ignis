import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/sign-in")({
  staticData: { title: "Sign In" },
});
