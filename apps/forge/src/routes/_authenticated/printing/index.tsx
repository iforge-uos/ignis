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

export const Route = createFileRoute("/_authenticated/printing/")({
  component: indexComponent,
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
import { Card, CardContent, CardDescription, CardHeader } from "@packages/ui/components/card";

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

function indexComponent() {
  return (
    <>
      <Title prompt="Printing" />
      <div className="flex justify-center my-10">
        <IForgeLogo className="w-96 pointer-events-none" />
      </div>
      <h2>
        <p className="mx-14 text-4xl mb-2 font-futura text-balance">
          The University of Sheffield's IForge makerspace 3d printing.
        </p>
      </h2>
      <div className="relative flex h-fit w-full flex-col items-center justify-center rounded-md mb-4">
        <ImageCarousel />
      </div>
      <div className="relative flex justify-center w-full mb-8">
        <Button asChild className="h-auto px-8 py-3 text-lg">
          <Link to="/printing/public/dashboard">Click here to see our available printers</Link>
        </Button>
      </div>
      <div className="relative flex gap-8 mb-8 px-8">
        <Card className="flex-1 p-6">
          <CardHeader className="flex flex-row items-left justify-left gap-2 font-bold text-left text-3xl font-futura -mb-4 -px-8">
            <CircleCheckBig />
            Capabilities:
          </CardHeader>
          <CardContent>
            <ul className="list-[circle] list-inside">
              <li>PLA, PETG and TPU only</li>
              <li>Max printing time of 7 hours for PLA or 10 hours for PETG/TPU</li>
              <li>Max print volume of WxDxH</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="flex-1 p-6">
          <CardHeader className="flex flex-row items-left justify-left gap-2 font-bold text-left text-3xl font-futura -mb-4 -px-8">
            <Info />
            Design Tips:
          </CardHeader>
        </Card>
      </div>
    </>
  );
}
