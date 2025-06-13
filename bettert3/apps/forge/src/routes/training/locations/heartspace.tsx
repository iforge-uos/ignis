import { createFileRoute } from "@tanstack/react-router"
import { TrainingLocation, getData } from "@/components/training/TrainingLocation";
import { } from "@tanstack/react-router";

const Heartspace = () => (
  <TrainingLocation
    location={"HEARTSPACE"}
    optionalTrainingText={"SLA 3D printer, sewing machines, and mug press"}
    img={
      <img
        src={`${import.meta.env.VITE_CDN_URL}/files/training/heartspace.jpg`}
        alt={"Heartspace"}
        className={"absolute w-full object-fill"}
      />
    }
    trainings={Route.useLoaderData()}
  />
);

export const Route = createFileRoute("/training/locations/heartspace")({
  component: Heartspace,
  loader: async () => getData("HEARTSPACE"),
});
