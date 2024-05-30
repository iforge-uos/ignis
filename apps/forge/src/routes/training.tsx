import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/training")({
  staticData: { title: "Training" },
});
