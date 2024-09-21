import { Link } from "@tanstack/react-router";
import { Separator } from "@ui/components/ui/separator";
import Balancer from "react-wrap-balancer";
import { LocationIcon } from "../icons/Locations";

import { Entries, removeSuffix, toTitleCase } from "@/lib/utils";
import { locationStatus } from "@/services/signin/locationService";
import { PartialLocation } from "@ignis/types/sign_in";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import { DiscordIcon, GitHubIcon, InstagramIcon, LinkedInIcon, TwitterIcon, YouTubeIcon } from "../icons/Socials";
import { IForgeLogo } from "../icons/iforge";

function LocationStatusTooltip({ location }: { location: PartialLocation }) {
  let className: string;
  let tooltip: string;

  switch (location.status) {
    case "closed":
      className = "bg-cross";
      tooltip = "Closed";
      break;
    case "open":
      className = "bg-tick";
      tooltip = "Open";
      break;
    case "soon":
      className = "bg-orange-500";
      tooltip = "Opening/Closing Soon";
      break;
    default:
      throw new Error("Unreachable"); // TODO make this grey if the backend is down
  }
  return (
    <TooltipProvider>
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
    </TooltipProvider>
  );
}

export default function Footer() {
  const { data: locationStatuses } = useQuery({
    queryKey: ["locationStatus"],
    queryFn: locationStatus,
    staleTime: 20_000,
  });

  return (
    <footer>
      <br />
      <br />
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
            <h5 className="text-lg font-bold font-futura">Opening Hours</h5>
            <Balancer ratio="0.5">Open weekdays, subject to exams and holidays</Balancer>
            {locationStatuses && (
              <table className="w-full border-collapse items-center flex">
                <tbody>
                  {(Object.entries(locationStatuses) as Entries<typeof locationStatuses>).map(([name, location]) => (
                    <tr key={name} className="py-2">
                      <td>
                        <div className="flex items-center justify-center h-full">
                          <LocationIcon location={name} className="h-4" tooltip={false} />
                        </div>
                      </td>
                      <td className="pr-2">
                        <div className="flex items-center h-full">{toTitleCase(name)}</div>
                      </td>
                      <td>
                        <div className="flex items-center justify-between h-full">
                          <span>
                            {removeSuffix(location.opening_time, ":00")} to {removeSuffix(location.closing_time, ":00")}
                          </span>
                          <LocationStatusTooltip location={location} />
                        </div>
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
