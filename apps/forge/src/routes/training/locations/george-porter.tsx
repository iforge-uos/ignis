import georgePorterLocationImage from "@/../public/training/george_porter.jpg?lqip";
import { TrainingLocation } from "@/components/training/TrainingLocation";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "@/lib/orpc";
import { ensureQueryData } from "@/lib/query-utils";

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
  loader: async ({ context }) => await ensureQueryData(
    context.queryClient,
    orpc.locations.training.all.queryOptions({ input: { name: "GEORGE_PORTER" } }),
  ),
});
