import mainspaceLocationImage from "@/../public/training/mainspace.jpg?lqip";
import { TrainingLocation } from "@/components/training/TrainingLocation";
import { client, orpc } from "@/lib/orpc";
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
        alt={"Mainspace"}
        className={"absolute w-full object-fill xl:top-[-350px] lg:top-[-250px] md:top-[-100px] sm:top-[-20px] top-0"}
      />
    }
    trainings={Route.useLoaderData()}
  />
);

export const Route = createFileRoute("/training/locations/mainspace")({
  component: Mainspace,
  loader: async () => client.locations.training.all({ name: "MAINSPACE" }),
});
