import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/training/risk-assessments")({
  component: () => <div>Hello /training/risk-assessments!</div>,
});
