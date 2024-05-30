import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/signin")({
  staticData: { title: "Sign In" },
});
