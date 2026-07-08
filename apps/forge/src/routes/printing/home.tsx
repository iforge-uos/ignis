import { Button } from "@packages/ui/components/button";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@packages/ui/components/carousel";
import { createFileRoute, Link } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import React from "react";
import DotIndicator from "@/components/dot-indicator";
import Title from "@/components/title";
import { IForgeLogo } from "@/icons/IForge";
import { CircleCheckBig, Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@packages/ui/components/card";

export const Route = createFileRoute("/printing/home")({
  component: IndexComponent,
});

import boba from "@/../public/homepage/boba.webp?lqip";
import inspectingMaterials from "@/../public/homepage/inspecting-materials.webp?lqip";
import reps from "@/../public/reps/26.webp?lqip";
import repsInspectingBadges from "@/../public/homepage/reps-inspecting-badges.webp?lqip";
import usersAtTheSocialSpace from "@/../public/homepage/users-at-the-social-space.webp?lqip";
import usingTheDremel from "@/../public/homepage/using-the-dremel.webp?lqip";
import usingTheElectronicsBench from "@/../public/homepage/using-the-electronics-bench.webp?lqip";
import usingTheLaserCutter from "@/../public/homepage/using-the-laser-cutter.webp?lqip";
import usingTheSewingMachine from "@/../public/homepage/using-the-sewing-machine.webp?lqip";
import usingTheWaterJet from "@/../public/homepage/using-the-water-jet.webp?lqip";

const imagesForCarousel = [
  { ...boba, alt: "3D printed Boba Fett cosplay" },
  { ...inspectingMaterials, alt: "Users inspecting materials" },
  { ...repsInspectingBadges, alt: "Reps inspecting badges" },
  { ...reps, alt: "Reps of this year" },
  { ...usingTheLaserCutter, alt: "Users using a laser cutter" },
  { ...usingTheDremel, alt: "Users using the dremel" },
  { ...usersAtTheSocialSpace, alt: "Reps and users at the social space" },
  { ...usingTheWaterJet, alt: "Users using the water jet cutter" },
  { ...usingTheSewingMachine, alt: "Users using a sewing machine" },
  { ...usingTheElectronicsBench, alt: "Users using the electronics bench" },
] satisfies { src: string; alt: string; width: number; height: number; lqip: string }[];

const ImageCarousel = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <>
      <Carousel
        opts={{
          loop: true,
          skipSnaps: true,
        }}
        setApi={setApi}
        plugins={[
          Autoplay({
            playOnInit: true,
            // stopOnInteraction: true,
            stopOnFocusIn: true,
          }),
          WheelGesturesPlugin(),
        ]}
        className="h-fit w-4/5 items-center flex mb-8"
      >
        <CarouselContent>
          {imagesForCarousel.map((image) => (
            <CarouselItem key={image.src} className="basis-1/2 p-2 ">
              <img
                src={image.src}
                width={image.width}
                height={image.height}
                alt={image.alt}
                style={{ backgroundImage: `url("${image.lqip}")`, backgroundSize: "cover" }}
                className="object-cover aspect-[4/3] rounded-sm"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <DotIndicator count={count} current={current} />
    </>
  );
};

function uploadButton(user: ReturnType<typeof Route.useRouteContext>["user"]) {
  if (!user) return;
  const in_team = user.__typename === "users::Rep" && user.teams.some((t) => t.name === "3DP");
  const has_role = user.roles.some((r) => ["Admin", "Rep", "Printa"].includes(r.name));
  if (!(has_role || in_team)) return;

  const can_control = user.roles.some((r) => r.name === "Admin") || in_team;

  return (
    <div className="flex flex-col items-center sm:flex-row mb-4 p-4 gap-4">
      <div className="flex-1 flex justify-center">
        <Button asChild className="h-auto w-full px-8 py-1 text-lg">
          <Link to="/printing/queue/upload">Upload a 3D Print Here</Link>
        </Button>
      </div>
      {can_control && (
        <div className="flex-1 flex justify-center">
          <Button asChild className="h-auto w-full px-8 py-1 text-lg">
            <Link to="/printing/control">3D Print Control Dashboard</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function IndexComponent() {
  const { user } = Route.useRouteContext();
  return (
    <>
      <Title prompt="Printing" />
      <div className="flex justify-center my-10">
        <IForgeLogo className="w-96 pointer-events-none" />
      </div>
      <h2 className="mx-14 text-4xl mb-2 font-futura text-balance">
        The University of Sheffield's IForge makerspace 3d printing.
      </h2>
      {uploadButton(user)}
      <div className="relative flex h-fit w-full flex-col items-center justify-center rounded-md mb-4">
        <ImageCarousel />
      </div>
      <div className="relative flex flex-col sm:flex-row gap-8 mb-8 px-8">
        <Card className="flex-1 p-6">
          <CardHeader className="flex flex-row items-center justify-left gap-2 font-bold text-left text-3xl font-futura -mb-4 -px-8">
            <CircleCheckBig className="size-7 shrink-0" />
            Capabilities and Restrictions:
          </CardHeader>
          <CardContent>
            <ul className="list-[circle] list-inside">
              <li>PLA, PETG and TPU</li>
              <li>Max printing time of 7 hours for PLA or 10 hours for PETG/TPU</li>
              <li>Max print volume of WxDxH</li>
              <li>
                8 PLA printers: Prusa Core Ones, 2 PETG printers: Prusa MK4s, 1 TPU printer: Prusa MK4, 1 mixed: Bambu
                H2D with AMS
              </li>
              <li>No Weapons, knives or inappropraite items</li>
              <li>3D printed items aren't food safe</li>
              <li>
                No flat or rectangular objects, these can normally be bought in stock material (PS. We stock sheet
                acylic)
              </li>
            </ul>
            <div className="flex justify-center">
              <Button asChild className="h-auto px-8 py-1 text-lg">
                <Link to="/printing/public/dashboard">View our Printers here</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 p-6">
          <CardHeader className="flex flex-row items-center justify-left gap-2 font-bold text-left text-3xl font-futura -mb-4 -px-8">
            <Info className="size-7 shrink-0" />
            Design Tips:
          </CardHeader>
          <CardContent>
            <ul className="list-[circle] list-inside mb-4">
              <li>
                Design around pre-existing hardware like dowels or bolts, rather than printing your own, as they may be
                rejected
              </li>
              <li>Avoid overhangs, or make them 45 degrees to the build plate to reduce the need for supports</li>
              <li>Aim to have 1 large flat face for the bottom layer, for higher print success rates</li>
              <li>Prints are stronger when the force is parallel to the build plate, with layer lines</li>
              <li>
                If holes are present, aim to make them parallel with the build plate, or apply a teardrop shape to avoid
                the need for supports inside the hole
              </li>
            </ul>
            <div className="flex justify-center">
              <Button asChild className="h-auto px-8 py-1 text-lg">
                <Link to="/printing/tips">More information and tips here</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
