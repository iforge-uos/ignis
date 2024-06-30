import { Link } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { Separator } from "@ui/components/ui/separator";
import { useMediaQuery } from "react-responsive";
import Balancer from "react-wrap-balancer";
import { LocationIcon } from "../icons/Locations";

import { removeSuffix, toTitleCase } from "@/lib/utils";
import { locationStatus } from "@/services/signin/locationService";
import { useQuery } from "@tanstack/react-query";

export default function Footer() {
  const prefersDarkMode = useMediaQuery({ query: "(prefers-color-scheme: dark)" });
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
        <div className="grid md:grid-cols-[1.25fr_0.75fr_0.5fr] gap-12">
          <div className="flex flex-col gap-2 not-prose">
            <Link to="/">
              <h3 className="sr-only">iForge Makerspace</h3>
              <img
                src={`${import.meta.env.VITE_CDN_URL}/logos/iforge${prefersDarkMode ? "-dark" : ""}.png`}
                alt="Logo"
                width={265}
                className="hover:opacity-75 transition-all"
              />
            </Link>

            <p className="text-sm mt-3">
              <Balancer>
                iForge Makerspace at the University of Sheffield is the place to design and create, offering tools and
                resources for students and staff to bring their ideas to life.
              </Balancer>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h5 className="text-lg font-bold">Opening Hours</h5>
            <div>Open weekdays, subject to exams and holidays.</div>
            {locationStatuses && (
              <div className="flex flex-col">
                {/* TODO skelebones and make the traffic lights align */}
                {Object.entries(locationStatuses).map(([name, location]) => (
                  <div key={name} className="flex items-center">
                    <LocationIcon location={name} /> {toTitleCase(name)} - {removeSuffix(location.opening_time, ":00")}{" "}
                    to {removeSuffix(location.closing_time, ":00")}
                    <div
                      className={`size-1.5 bg-${
                        location.status === "closed" ? "red" : location.status === "open" ? "green" : "orange"
                      }-500 ml-2 rounded-lg`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h5 className="text-lg font-bold">Website</h5>
            <Link href="/" className="hover:underline">
              Locations
            </Link>
            <Link href="/" className="hover:underline">
              Projects
            </Link>
            <Link href="/" className="hover:underline">
              About Us
            </Link>
            <Link href="/" className="hover:underline">
              Contact
            </Link>
          </div>
          {/* <div className="flex flex-col gap-2">
            <h5 className="text-lg font-bold">Legal</h5>
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/cookie-policy" className="hover:underline">
              Cookie Policy
            </Link>
          </div> */}
        </div>
        <br />
        <Separator />
        <br />
        <div className="not-prose flex flex-col md:flex-row md:gap-2 gap-6 justify-between md:items-center mx-5">
          <div className="flex gap-2">
            {/* TODO move to icons */}
            <a href="https://instagram.com/iforge_uos">
              <Button variant="outline" size="icon">
                <img
                  src={`${import.meta.env.VITE_CDN_URL}/icons/github.svg`}
                  className="dark:invert h-6"
                  alt="GitHub"
                />
              </Button>
            </a>
            <Button variant="outline" size="icon">
              <img src={`${import.meta.env.VITE_CDN_URL}/icons/discord.svg`} className="dark:invert h-6" />
            </Button>
            <a href="https://instagram.com/iforge_uos">
              <Button variant="outline" size="icon">
                <img src={`${import.meta.env.VITE_CDN_URL}/icons/instagram.svg`} className="dark:invert h-6" />
              </Button>
            </a>
            <Button variant="outline" size="icon">
              <img src={`${import.meta.env.VITE_CDN_URL}/icons/linkedin.svg`} className="dark:invert h-6" />
            </Button>
            <Button variant="outline" size="icon">
              <img src={`${import.meta.env.VITE_CDN_URL}/icons/twitter.svg`} className="dark:invert h-6" />
            </Button>
            <Button variant="outline" size="icon">
              <img src={`${import.meta.env.VITE_CDN_URL}/icons/youtube.svg`} className="dark:invert h-6" />
            </Button>
          </div>
          <p className="text-muted-foreground">© iForge Makerspace. All rights reserved. 2015-present.</p>
        </div>
      </div>
    </footer>
  );
}
