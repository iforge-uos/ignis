import Title from "@/components/title";
import ImageGradient from "@/components/training/ImageGradient";
import { useUser } from "@/hooks/useUser";
import { client } from "@/lib/orpc";
import IndexCard from "@/routes/training/-components/IndexCard";
import { GeorgePorterIcon, HeartspaceIcon, MainspaceIcon } from "@packages/ui/icons/Locations";
import { Button } from "@packages/ui/components/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@packages/ui/components/command";
import { Separator } from "@packages/ui/components/separator";
import { Link, createFileRoute } from "@tanstack/react-router";
import { SearchCheckIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TrainingContent } from "../_authenticated/training/$id";

export default async function TrainingIndexPage() {
  const trainings = Route.useLoaderData();
  const user = useUser();
  const [hidden, setHidden] = useState(true);
  const commandRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
      setHidden(true);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <Title prompt="Training" />
      <div className="p-4 mt-1">
        <h1 className="text-4xl font-bold font-futura sm:text-5xl md:text-6xl text-center">
          Welcome to the iForge's User Training
        </h1>
        <Separator className="my-6" />
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-center mb-4">Search for a course</h3>
          <Command
            ref={commandRef}
            className="flex justify-center w-3/4 mx-auto max-w-[720px] rounded-lg"
            onFocus={() => setHidden(false)}
          >
            <CommandInput placeholder="Enter all or part of a course name..." />
            <CommandList hidden={hidden}>
              <CommandEmpty>No results found :(</CommandEmpty>
              {trainings.map((training) => (
                <CommandItem value={training.name} className="flex justify-between" key={training.id}>
                  <Link to="/training/$id" params={training}>
                    <div className="flex gap-3 justify-center items-center">
                      {training.locations.map((location) => (
                        <LocationIcon key={location} location={location as training.LocationName} />
                      ))}
                      <div className="flex-col">
                        <div className="font-semibold">{training.name}</div>
                        <TrainingContent content={training.description} className="text-sm flex" />
                      </div>
                    </div>
                  </Link>
                  {user?.roles.some((role) => role.name === "Rep") && (
                    <Link to="/training/$id" params={training.rep} key={training.rep.id}>
                      <Button size="sm" className="text-sm" variant="info">
                        Rep Training
                      </Button>
                    </Link>
                  )}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </div>
        <h2 className="text-4xl font-semibold font-futura mb-4 text-center">Locations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center mx-auto min-h-72 max-w-[1440px]">
          <div className="w-full max-h-72">
            <Link to="/training/locations/mainspace">
              <IndexCard
                // TODO this doesn't cover the entirety of the box for some reason in lg
                img={
                  <ImageGradient gradientColor="mainspace">
                    {/* TODO this doesn't cover the entirety of the box for some reason in lg */}
                    <img
                      src={`${import.meta.env.VITE_CDN_URL}/files/training/mainspace.jpg`}
                      alt="iForge Mainspace"
                      className="w-full object-fill"
                    />
                  </ImageGradient>
                }
                title={
                  <span className="flex gap-2 items-center">
                    <MainspaceIcon className="stroke-white" tooltip={false} />
                    Mainspace
                  </span>
                }
                description="Training for the iForge Mainspace located in the Diamond."
                className="h-full"
              />
            </Link>
          </div>
          <div className="w-full max-h-72">
            <Link to="/training/locations/heartspace">
              <IndexCard
                img={
                  <ImageGradient gradientColor="heartspace">
                    <img
                      src={`${import.meta.env.VITE_CDN_URL}/files/training/heartspace.jpg`}
                      alt="iForge Heartspace"
                      className="w-full object-fill"
                    />
                  </ImageGradient>
                }
                title={
                  <span className="flex gap-2 items-center">
                    <HeartspaceIcon className="stroke-white" tooltip={false} />
                    Heartspace
                  </span>
                }
                description="Training for the iForge Mainspace located in the Heartspace."
                className="h-full"
              />
            </Link>
          </div>
          <div className="w-full max-h-72">
            <Link to="/training/locations/george-porter">
              <IndexCard
                img={
                  <ImageGradient gradientColor="george-porter">
                    <img
                      src={`${import.meta.env.VITE_CDN_URL}/files/training/george_porter.jpg`}
                      alt="George Porter"
                      className="w-full object-fill"
                    />
                  </ImageGradient>
                }
                title={
                  <span className="flex gap-2 items-center">
                    <GeorgePorterIcon className="stroke-white" tooltip={false} />
                    George Porter
                  </span>
                }
                description="Training appropriate for CCA members looking to gain access to the George Porter building and its training."
                className="h-full"
              />
            </Link>
          </div>
        </div>
        <Separator className="my-6" />
        <h2 className="text-4xl font-semibold font-futura text-center m-4">Useful Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center mx-auto min-h-72 max-w-[1440px]">
          <div className="flex w-full max-h-80 justify-items-center">
            <Link to="/training/approved-materials">
              <IndexCard
                img={
                  <ImageGradient gradientColor="tick">
                    <img
                      src={`${import.meta.env.VITE_CDN_URL}/files/training/approved_materials.jpg`}
                      alt="Approved materials"
                    />
                  </ImageGradient>
                }
                title={
                  <span className="flex gap-2 items-center">
                    <SearchCheckIcon />
                    Approved Materials
                  </span>
                }
                description="COSHH regulations for materials in the iForge."
                className="h-full w-full"
              />
            </Link>
          </div>
          <div className="w-full max-h-80">
            <Link to="/training/risk-assessments">
              <IndexCard
                img={
                  <ImageGradient gradientColor="cross">
                    <img
                      src={`${import.meta.env.VITE_CDN_URL}/files/training/risk_assessments.jpg`}
                      alt="Risk Assessment"
                    />
                  </ImageGradient>
                }
                title={
                  <span className="flex gap-2 items-center">
                    <TriangleAlertIcon />
                    Risk Assessment
                  </span>
                }
                description="The various risk assessments for the spaces."
                className="h-full w-full"
              />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/training/")({
  component: TrainingIndexPage,
  loader: client.training.all,
});
