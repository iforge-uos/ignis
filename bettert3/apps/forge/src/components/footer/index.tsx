"use client";

import { Entries, removeSuffix, toTitleCase } from "@/lib/utils";
import { locationStatus } from "@/services/sign_in/locationService";
import { PartialLocation } from "@packages/types/sign_in";
import { LocationIcon } from "@packages/ui/components/icons/Locations";
import {
  DiscordIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
  YouTubeIcon,
} from "@packages/ui/components/icons/Socials";
import { IForgeLogo } from "@packages/ui/components/icons/iforge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Separator } from "@ui/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/components/ui/tooltip";
import Balancer from "react-wrap-balancer";

function LocationStatusTooltip({ location }: { location: PartialLocation }) {
  let className: string;
  let tooltip: string;

  switch (location.status) {
    case "CLOSED":
      className = "bg-cross";
      tooltip = "Closed";
      break;
    case "OPEN":
      className = "bg-tick";
      tooltip = "Open";
      break;
    case "SOON":
      className = "bg-orange-500";
      tooltip = "Opening/Closing Soon";
      break;
    default:
      throw new Error("Unreachable"); // TODO make this grey if the backend is down
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="p-2 ml-0.5 hover:cursor-pointer">
          <div className={`size-2 ${className} rounded-lg`} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function Footer() {
  const { data: locationStatuses } = useQuery({
    queryKey: ["locationStatus"],
    queryFn: locationStatus,
    staleTime: 20_000,
  });

  return (
    <footer className="bg-card border-t-2 p-5 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mx-2 md:mx-5 gap-8 md:gap-4">
        <div className="flex flex-col gap-2 not-prose max-w-full md:max-w-[30rem]">
          <Link to="/">
            <h3 className="sr-only">iForge Makerspace</h3>
            <IForgeLogo className="w-[200px] md:w-[250px] hover:opacity-75 transition-all" />
          </Link>

          <p className="mt-3">
            <Balancer>
              iForge Makerspace at the University of Sheffield is the place to design and create, offering tools and
              resources for students and staff to bring their ideas to life
            </Balancer>
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <h5 className="text-lg font-bold font-futura">Opening Hours</h5>
          <Balancer ratio="0.5">Open weekdays, subject to exams and holidays</Balancer>
          {locationStatuses && (
            <table className="w-full border-collapse items-center flex">
              <tbody className="w-full">
                {(Object.entries(locationStatuses) as Entries<typeof locationStatuses>).map(([name, location]) => (
                  <tr key={name} className="py-2 flex flex-wrap justify-between w-full">
                    <td className="flex items-center">
                      <LocationIcon location={name} className="h-4 mr-2" tooltip={false} />
                      <span>{toTitleCase(name)}</span>
                    </td>
                    <td className="flex items-center justify-end">
                      <span className="text-sm md:text-base">
                        {removeSuffix(location.opening_time, ":00")} to {removeSuffix(location.closing_time, ":00")}
                      </span>
                      <LocationStatusTooltip location={location} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h5 className="text-lg font-bold font-futura">Website</h5>
          <Link to="/locations" className="hover:underline underline-offset-4">
            Locations
          </Link>
          <Link to="/projects" className="hover:underline underline-offset-4">
            Projects
          </Link>
          <Link to="/about" className="hover:underline underline-offset-4">
            About Us
          </Link>
          <Link to="/contact" className="hover:underline underline-offset-4">
            Contact
          </Link>
        </div>
      </div>
      <br />
      <Separator />
      <br />
      <div className="not-prose flex flex-col md:flex-row md:gap-2 gap-6 justify-between md:items-center mx-2 md:mx-5">
        <div className="flex gap-4 md:gap-2 justify-center md:justify-start">
          <GitHubIcon />
          <DiscordIcon />
          <InstagramIcon />
          <LinkedInIcon />
          <TwitterIcon />
          <YouTubeIcon />
        </div>
        <p className="text-muted-foreground text-center md:text-left text-sm md:text-base">
          © iForge Makerspace. All rights reserved. 2017-present.
        </p>
      </div>
    </footer>
  );
}
