import { Link } from "@tanstack/react-router";
import { Separator } from "@ui/components/ui/separator";
import Balancer from "react-wrap-balancer";
import { LocationIcon } from "../icons/Locations";

import { removeSuffix, toTitleCase } from "@/lib/utils";
import { locationStatus } from "@/services/signin/locationService";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import { DiscordIcon, GitHubIcon, InstagramIcon, LinkedInIcon, TwitterIcon, YouTubeIcon } from "../icons/Socials";
import { IForgeLogo } from "../icons/iforge";

export default function Footer() {
  const {
    data: locationStatuses,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["locationStatus"],
    queryFn: locationStatus,
    staleTime: 20_000,
  });

  return (
    <footer>
      <div className="bg-card border-t-2 p-10">
        <div className="flex justify-between items-end mx-5">
          <div className="flex flex-col gap-2 not-prose max-w-[30rem]">
            <Link to="/">
              <h3 className="sr-only">iForge Makerspace</h3>
              <IForgeLogo className="w-[250px] hover:opacity-75 transition-all" />
            </Link>

            <p className="mt-3">
              <Balancer>
                iForge Makerspace at the University of Sheffield is the place to design and create, offering tools and
                resources for students and staff to bring their ideas to life
              </Balancer>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h5 className="text-lg font-bold">Opening Hours</h5>
            <Balancer ratio="0.5">Open weekdays, subject to exams and holidays</Balancer>
            {locationStatuses && (
              <div className="flex flex-col">
                {/* TODO skelebones and make the traffic lights align */}
                {Object.entries(locationStatuses).map(([name, location]) => (
                  <div key={name} className="flex items-center">
                    <LocationIcon location={name} className="h-4" /> {toTitleCase(name)} -{" "}
                    {removeSuffix(location.opening_time, ":00")} to {removeSuffix(location.closing_time, ":00")}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-2 ml-0.5 hover:cursor-pointer">
                            <div
                              className={`size-1.5 bg-${
                                location.status === "closed" ? "red" : location.status === "open" ? "green" : "orange"
                              }-500 rounded-lg`}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {location.status === "closed"
                              ? "Closed"
                              : location.status === "open"
                                ? "Open"
                                : "Opening/Closing Soon"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h5 className="text-lg font-bold">Website</h5>
            <Link href="/" className="hover:underline underline-offset-4">
              Locations
            </Link>
            <Link href="/" className="hover:underline underline-offset-4">
              Projects
            </Link>
            <Link href="/" className="hover:underline underline-offset-4">
              About Us
            </Link>
            <Link href="/" className="hover:underline underline-offset-4">
              Contact
            </Link>
          </div>
        </div>
        <br />
        <Separator />
        <br />
        <div className="not-prose flex flex-col md:flex-row md:gap-2 gap-6 justify-between md:items-center mx-5">
          <div className="flex gap-2">
            <GitHubIcon />
            <DiscordIcon />
            <InstagramIcon />
            <LinkedInIcon />
            <TwitterIcon />
            <YouTubeIcon />
          </div>
          <p className="text-muted-foreground">© iForge Makerspace. All rights reserved. 2017-present.</p>
        </div>
      </div>
    </footer>
  );
}
