import { TrainingLocation, getData } from "@/components/training/TrainingLocation";
import {} from "@tanstack/react-router";

const GeorgePorter = () => (
  <TrainingLocation
    location={"GEORGE_PORTER"}
    optionalTrainingText={"carbon fibre layup station"}
    img={
      <img
        src={`${import.meta.env.VITE_CDN_URL}/files/training/george_porter.jpg`}
        alt={"George Porter"}
        className={"absolute w-full object-fill"}
      />
    }
    trainings={Route.useLoaderData()}
  />
);

export const Route = createFileRoute({
  component: GeorgePorter,
  loader: async () => getData("GEORGE_PORTER"),
});
