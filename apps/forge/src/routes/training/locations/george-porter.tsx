import TrainingLocation from "@/components/training/TrainingLocation";
import { createFileRoute, Link } from "@tanstack/react-router";

const GeorgePorter = () => (
  <Link to="https://training.iforge.shef.ac.uk/subject-areas/george-porter-cca-rep/online" />
  // <TrainingLocation location={"GEORGE_PORTER"} optionalTrainingText={"carbon fibre layup station"} />
);

export const Route = createFileRoute("/training/locations/george-porter")({
  component: GeorgePorter,
});
