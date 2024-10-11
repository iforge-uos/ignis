import TrainingLocation from "@/components/training/TrainingLocation";
import { createFileRoute } from "@tanstack/react-router";

const Heartspace = () => (
  <TrainingLocation location={"HEARTSPACE"} optionalTrainingText={"SLA 3D printer, sewing machines, and mug press"} />
);

export const Route = createFileRoute("/training/locations/heartspace")({
  component: Heartspace,
});
