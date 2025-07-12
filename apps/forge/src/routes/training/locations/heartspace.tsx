import heartspaceLocationImage from "@/../public/training/heartspace.jpg?lqip";
import { TrainingLocation, getData } from "@/components/training/TrainingLocation";
import { createFileRoute } from "@tanstack/react-router";

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
