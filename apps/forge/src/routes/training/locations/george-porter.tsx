import TrainingLocation from "@/components/training/TrainingLocation";
import { createFileRoute } from "@tanstack/react-router";

const GeorgePorter = () => (
  <TrainingLocation location={"GEORGE_PORTER"} optionalTrainingText={"carbon fibre layup station"} />
);

export const Route = createFileRoute("/training/locations/george-porter")({
  component: GeorgePorter,
});
