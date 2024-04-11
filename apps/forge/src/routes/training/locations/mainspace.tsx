import TrainingLocation from "@/components/training/TrainingLocation";
import { createFileRoute } from "@tanstack/react-router";

const Mainspace = () => (
  <TrainingLocation location={"MAINSPACE"} optionalTrainingText={"CNC mill, laser cutter, and 3D printer"} />
);

export const Route = createFileRoute("/training/locations/mainspace")({
  component: Mainspace,
});
