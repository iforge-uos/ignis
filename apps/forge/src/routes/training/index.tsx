import Title from "@/components/title";
import IndexCard from "@/routes/training/-components/IndexCard.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { Separator } from "@ui/components/ui/separator";

const handleNavigation = (url: string) => {
  window.location.href = url;
};

export default function TrainingIndexPage() {
  return (
    <>
      <Title prompt="Training" />
      <div className="p-4 mt-1">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-wide sm:text-5xl md:text-6xl">
            Welcome to the iForge's User Training
          </h1>
        </div>
        <div className="mb-8">
          {/* // TODO add this */}
          <h2 className="text-2xl font-semibold text-center mb-4">Search for a course</h2>
          <div className="relative w-3/4 mx-auto">
            <input
              placeholder="Enter all or part of a course name..."
              className="border-2 bg-inherit border-gray-300 rounded-md py-2 px-4 w-full ring-offset-background placeholder:text-muted-foreground outline-primary"
            />
            <Button className="absolute top-0 right-0 m-0.5">Search</Button>
          </div>
        </div>
        <h4 className="text-3xl font-semibold mb-4 text-center">Locations</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center mx-auto">
          <IndexCard
            to="/training/locations/mainspace"
            imageSrc={`${import.meta.env.VITE_CDN_URL}/files/mainspace_training.jpg`}
            imageAlt="iForge Mainspace"
            title="iForge Mainspace"
            description="Training for the iForge Mainspace located in the Diamond."
            gradientColor="mainspace"
          />
          <IndexCard
            to="/training/locations/heartspace"
            imageSrc="/placeholder.svg"
            imageAlt="iForge Heartspace"
            title="iForge Heartspace"
            description="Training for the iForge Mainspace located in the Heartspace."
            gradientColor="heartspace"
          />
          <IndexCard
            onClick={() =>
              handleNavigation("https://training.iforge.shef.ac.uk/subject-areas/george-porter-cca-rep/online")
            }
            imageSrc="/placeholder.svg"
            imageAlt="George Porter CCA Workshop"
            title="George Porter CCA Workshop"
            description="Training appropriate for CCA members looking to gain access to the iTec and its training."
            gradientColor="george-porter"
          />
        </div>
        <br />
        <Separator />
        <h3 className="text-2xl font-semibold text-center m-4">Useful links</h3>
        <br />
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center mx-auto">
            <IndexCard
              to="/training/approved-materials"
              imageSrc="/placeholder.svg"
              imageAlt="Approved materials"
              title="Approved Materials"
              description="COSHH regulations for materials in the iForge."
              gradientColor="muted"
            />
            <IndexCard
              to="/training/risk-assessments"
              imageSrc="/placeholder.svg"
              imageAlt="iForge Risk Assessment"
              title="iForge Risk Assessment"
              description="The various risk assessments for the spaces."
              gradientColor="muted"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/training/")({
  component: TrainingIndexPage,
});
