import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_reponly/sign-in")({
  staticData: { title: "Sign In" },
});
