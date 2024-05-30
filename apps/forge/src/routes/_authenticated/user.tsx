import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/user")({
  staticData: { title: "User" },
});
