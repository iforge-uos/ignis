import mainspaceLocationImage from "@/../public/training/mainspace.jpg?lqip";
import { TrainingLocation } from "@/components/training/TrainingLocation";
import { orpc } from "@/lib/orpc";
import { ensureQueryData } from "@/lib/query-utils";
import { createFileRoute } from "@tanstack/react-router";

const Mainspace = () => (
  <TrainingLocation
    location={"MAINSPACE"}
    optionalTrainingText={"CNC mill, laser cutter, and 3D printer"}
    img={
      <img
        src={mainspaceLocationImage.src}
        width={mainspaceLocationImage.width}
        height={mainspaceLocationImage.height}
        style={{ backgroundImage: `url("${mainspaceLocationImage.lqip}")`, backgroundSize: "cover" }}
        alt="Mainspace"
        className="w-full h-full object-cover"
      />
    }
    trainings={Route.useLoaderData()}
  />
);

export const Route = createFileRoute("/training/locations/mainspace")({
  component: Mainspace,
  loader: async ({ context }) => await ensureQueryData(
    context.queryClient,
    orpc.locations.training.all.queryOptions({ input: { name: "MAINSPACE" } }),
  ),
});
