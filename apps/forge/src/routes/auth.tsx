import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  staticData: { title: "Auth" },
});
