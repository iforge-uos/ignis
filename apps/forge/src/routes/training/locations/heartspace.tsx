import heartspaceLocationImage from "@/../public/training/heartspace.jpg?lqip";
import { TrainingLocation } from "@/components/training/TrainingLocation";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "@/lib/orpc";
import { ensureQueryData } from "@/lib/query-utils";

const Heartspace = () => (
  <TrainingLocation
    location={"HEARTSPACE"}
    optionalTrainingText={"SLA 3D printer, sewing machines, and mug press"}
    img={
      <img
        src={heartspaceLocationImage.src}
        width={heartspaceLocationImage.width}
        height={heartspaceLocationImage.height}
        style={{ backgroundImage: `url("${heartspaceLocationImage.lqip}")`, backgroundSize: "cover" }}
        alt="Heartspace"
        className="w-full h-full object-cover"
      />
    }
    trainings={Route.useLoaderData()}
  />
);

export const Route = createFileRoute("/training/locations/heartspace")({
  component: Heartspace,
  loader: async ({ context }) => await ensureQueryData(
    context.queryClient,
    orpc.locations.training.all.queryOptions({ input: { name: "HEARTSPACE" } }),
  ),
});
