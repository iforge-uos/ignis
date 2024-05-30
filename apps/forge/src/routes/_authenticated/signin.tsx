import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/signin")({
  staticData: { title: "Sign In" },
});
