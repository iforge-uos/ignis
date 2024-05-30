import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_reponly/users")({
  staticData: { title: "User" },
});
