import Title from "@/components/title";
import { extractError, toTitleCase, useUser } from "@/lib/utils";
import { getLocation } from "@/services/training/getLocation";
import { getStatus } from "@/services/training/getStatus";
import { Location, PartialTrainingWithStatus } from "@ignis/types/training";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "@ui/components/ui/loader";
import { Separator } from "@ui/components/ui/separator";
import TrainingCourseCard from "./TrainingCourseCard";

// don't ask why this is in the components folder
async function getData(location: Location): Promise<PartialTrainingWithStatus[]> {
  const [trainings, statuses]: any = await Promise.all([getLocation(location), getStatus(location)]);
  for (const training of trainings) {
    training.status = statuses[training.id];
    if (training.rep) {
      training.rep.status = statuses[training.rep.id];
    }
  }
  return trainings;
}

interface TrainingLocationProps {
  location: Location;
  img?: string;
  optionalTrainingText: string;
}

export default function TrainingLocation({ location, img, optionalTrainingText }: TrainingLocationProps) {
  const user = useUser();
  const name = toTitleCase(location.split("_").join(" "));
  const isRep = !!user?.roles.some((role) => role.name === "Rep");
  const {
    data: trainings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trainingLocation", location],
    queryFn: async () => getData(location),
  });
  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return (
      <>
        An error occurred fetching trainings
        <br />
        {extractError(error!)}
      </>
    );
  }
  const { compulsory, not_compulsory } = trainings!.reduce(
    (acc, training) => {
      training.compulsory ? acc.compulsory.push(training) : acc.not_compulsory.push(training);
      return acc;
    },
    { compulsory: [] as PartialTrainingWithStatus[], not_compulsory: [] as PartialTrainingWithStatus[] },
  );

  return (
    <>
      <Title prompt={`${name} Training`} />
      <div className="container grid items-center gap-4 px-4 py-12">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-bold tracking-wide sm:text-5xl md:text-6xl">{name} Training</h1>
          <img
            className="flex justify-center aspect-[32/9] object-cover"
            src={`${import.meta.env.VITE_CDN_URL}/files/mainspace_training.jpg`}
          />
          <div className="mx-auto max-w-[600px] text-accent-foreground sm:text-2xl md:text-3xl">
            Complete the following trainings to gain access to the machines and tools in the {name}.
          </div>
        </div>
      </div>
      <Separator />
      <div>
        <div className="container py-12 md:py-16">
          <div className="grid items-center gap-4 px-4 text-center lg:gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-wide sm:text-5xl md:text-6xl">Compulsory Training</h1>
              <div className="mx-auto max-w-[600px] text-accent-foreground sm:text-lg md:text-xl">
                Complete these trainings to gain access to the {name}.
              </div>
            </div>
            <div className="grid gap-4 align-middle w-full grid-cols-1 items-stretch justify-center md:grid-cols-2 lg:grid-cols-3">
              {compulsory
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((training) => (
                  <TrainingCourseCard key={training.id} training={training} isRep={isRep} />
                ))}
            </div>
          </div>
        </div>
      </div>
      <Separator />
      <div>
        <div className="container py-12 md:py-16">
          <div className="grid items-center gap-4 px-4 text-center lg:gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-wide sm:text-5xl md:text-6xl">Machine & Equipment Training</h1>
              <div className="mx-auto max-w-[600px] text-accent-foreground sm:text-lg md:text-xl">
                Extra trainings for machines/tools such as the {optionalTrainingText}.
              </div>
            </div>
            <div className="grid gap-4 align-middle w-full grid-cols-1 items-stretch justify-center md:grid-cols-2 lg:grid-cols-3">
              {not_compulsory
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((training) => (
                  <TrainingCourseCard key={training.id} training={training} isRep={isRep} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
