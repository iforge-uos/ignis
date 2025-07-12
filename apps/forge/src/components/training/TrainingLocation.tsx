import Title from "@/components/title";
import { useUser } from "@/hooks/useUser";
import { toTitleCase } from "@/lib/utils";
import { locationNameToCSSName } from "@/lib/utils/training";
import { training } from "@packages/types";
import { LocationName, PartialTrainingWithStatus } from "@packages/types/training";
import { Button } from "@packages/ui/components/button";
import { Separator } from "@packages/ui/components/separator";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CirclePlus } from "lucide-react";
import ImageGradient from "./ImageGradient";
import TrainingCourseCard from "./TrainingCourseCard";

// don't ask why this is in the components folder
export async function getData(location: LocationName): Promise<PartialTrainingWithStatus[]> {
  const [trainings, statuses]: any = await Promise.all([getLocation(location), getStatus(location)]); // FIXME needs to not call status if not authed
  for (const training of trainings) {
    training.status = statuses[training.id];
    if (training.rep) {
      training.rep.status = statuses[training.rep.id];
    }
  }
  return trainings;
}

interface TrainingLocationProps {
  location: LocationName;
  img: React.ReactNode;
  optionalTrainingText: string;
  trainings: PartialTrainingWithStatus[];
}

export function TrainingLocation({ location, optionalTrainingText, img, trainings }: TrainingLocationProps) {
  const user = useUser();
  const name = toTitleCase(location.replace("_", " "));
  const isRep = !!user?.roles.some((role) => role.name === "Rep");

  const { compulsory, not_compulsory } = trainings.reduce(
    (acc, training) => {
      training.compulsory ? acc.compulsory.push(training) : acc.not_compulsory.push(training);
      return acc;
    },
    { compulsory: [] as PartialTrainingWithStatus[], not_compulsory: [] as PartialTrainingWithStatus[] },
  );
  const { data: userTraining } = useQuery({
    queryKey: ["userTraining"],
    queryFn: async () => (user ? getUserTraining(user.id) : undefined),
  });

  return (
    <>
      <Title prompt={`${name} Training`} />
      <div className="container grid items-center gap-4 px-4 py-12">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-bold tracking-wide sm:text-5xl md:text-6xl">{name} Training</h1>
          <div className="group relative overflow-hidden w-full max-w-m rounded-lg shadow-md h-[400px]">
            <ImageGradient gradientColor={locationNameToCSSName(location)}>{img}</ImageGradient>

            <div className="absolute bottom-0 left-0 right-0 px-6 pb-4">
              <p className="text-gray-300 sm:text-l md:text-xl">
                Complete the following trainings to gain access to the machines and tools in the {name}.
              </p>
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
                    <TrainingCourseCard
                      key={training.id}
                      training={training}
                      isRep={isRep}
                      userTraining={userTraining}
                    />
                  ))}
                {isRep && <AddNewTraining location={location} compulsory />}
              </div>
            </div>
          </div>
        </div>
        <Separator />
        <div>
          <div className="container py-12 md:py-16">
            <div className="grid items-center gap-4 px-4 text-center lg:gap-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-wide sm:text-5xl md:text-6xl">
                  Machine & Equipment Training
                </h1>
                <div className="mx-auto max-w-[600px] text-accent-foreground sm:text-lg md:text-xl">
                  Extra trainings for machines/tools such as the {optionalTrainingText}.
                </div>
              </div>
              <div className="grid gap-4 align-middle w-full grid-cols-1 items-stretch justify-center md:grid-cols-2 lg:grid-cols-3">
                {not_compulsory
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((training) => (
                    <TrainingCourseCard
                      key={training.id}
                      training={training}
                      isRep={isRep}
                      userTraining={userTraining}
                    />
                  ))}
                {isRep && <AddNewTraining location={location} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AddNewTraining({ location, ...props }: any) {
  return (
    <Link to="/training/new" params={props}>
      <Button
        className={`w-full max-w-sm overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg
          flex-col h-full justify-center items-center`}
        variant="success"
      >
        <div className="p-4 flex flex-col justify-center items-center flex-grow">
          <CirclePlus className="h-36 w-36 self-center m-2" />
          <h3 className="text-2xl font-bold text-foreground mb-2 text-balance">Add new training</h3>
        </div>
      </Button>
    </Link>
  );
}
