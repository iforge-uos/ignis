import georgePorterLocationImage from "@/../public/training/george_porter.jpg?lqip";
import { TrainingLocation } from "@/components/training/TrainingLocation";
import { createFileRoute } from "@tanstack/react-router";
import { client, orpc } from "@/lib/orpc";

const GeorgePorter = () => (
  <TrainingLocation
    location={"GEORGE_PORTER"}
    optionalTrainingText={"carbon fibre layup station"}
    img={
      <img
        src={georgePorterLocationImage.src}
        width={georgePorterLocationImage.width}
        height={georgePorterLocationImage.height}
        style={{ backgroundImage: `url("${georgePorterLocationImage.lqip}")`, backgroundSize: "cover" }}
        alt={"George Porter"}
        className={"absolute w-full object-fill"}
      />
    }
    trainings={Route.useLoaderData()}
  />
);

export const Route = createFileRoute("/training/locations/george-porter")({
  component: GeorgePorter,
  loader: async () => client.locations.training.all({name: "GEORGE_PORTER"}),
});
