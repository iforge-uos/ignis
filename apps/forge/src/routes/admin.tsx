import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  staticData: { title: "Admin" },
});
