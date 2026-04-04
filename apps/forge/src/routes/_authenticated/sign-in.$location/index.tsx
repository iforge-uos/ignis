import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Activity, Clock3, ExternalLink, ListChecks, ShieldCheck } from "lucide-react";
import MainspaceFloorPlanSvgMarkup from "@/../public/floorplans/mainspace-floor-plan.svg?raw";
import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import BusyChart from "@/components/sign-in/BusyChart";
import FloorPlan from "@/components/sign-in/FloorPlan";
import HistoricQueuePanel from "@/components/sign-in/HistoricQueuePanel";
import HistoricSignInsPanel from "@/components/sign-in/HistoricSignInsPanel";
import Title from "@/components/title";
import { useUserRoles } from "@/hooks/useUserRoles";
import { orpc } from "@/lib/orpc";
import UCardInput from "../_reponly/sign-in.$location/$ucard_number/-components/UCardInput";

const SignInIndexAppComponent = () => {
  const resourceItems = [
    {
      title: "iForge Discord",
      description: "Join the iForge Discord if you haven't already.",
      externalLink: "https://iforge.sheffield.ac.uk/discord",
    },
    {
      title: "Top up till credit",
      description: "Add money to your till balance to make purchases in the iForge.",
      externalLink: "https://onlinepayments.shef.ac.uk/papercut",
    },
  ];

  const roles = useUserRoles();
  const {name: activeLocation} = Route.useRouteContext();
  const isRep = roles.some((role) => role === "rep");
  const isAdmin = roles.some((role) => role === "admin");
  const canViewDetailedUsage = isRep || isAdmin;

  if (isRep) {
    resourceItems.push(
      {
        title: "Purchase Form",
        description: "Add items that need to be purchased to the list via the purchase form.",
        externalLink:
          "https://docs.google.com/forms/d/e/1FAIpQLScdLTE7eXqGQRa3e0UfymYo8qjlNTyu5xfIyArMG0wGQgHjyw/viewform",
      },
      {
        title: "iDocs",
        description: "Team-specific documentation and operational references.",
        externalLink: "https://docs.iforge.shef.ac.uk",
      },
    );
  }

  const { data: location } = useQuery({
    ...orpc.locations.get.experimental_liveOptions({ input: { name: activeLocation } }),
    enabled: canViewDetailedUsage,
  });

  const { data: occupancyForecast } = useQuery({
    ...orpc.locations.occupancyForecast.queryOptions({ input: { name: activeLocation } }),
    staleTime: 3_600_000,
    refetchInterval: 3_600_000,
    refetchOnWindowFocus: true,
  });

  const { data: tools } = useQuery({
    ...orpc.locations.tools.all.queryOptions({ input: { name: activeLocation } }),
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <Title prompt="Sign In Dashboard" />
      <div className="p-4 mt-1">
        <ActiveLocationSelector />
        <div className="rounded-md border-2 p-4 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4" />
              <h2 className="text-lg font-semibold">At a Glance</h2>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {isRep && <UCardInput />}
              <BusyChart data={occupancyForecast} />
            </div>
            <FloorPlan
              svgMarkup={activeLocation === "MAINSPACE" ? MainspaceFloorPlanSvgMarkup : undefined}
              locationName={activeLocation}
              tools={tools}
            />
          </section>


          {canViewDetailedUsage && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock3 className="size-4" />
                <h2 className="text-lg font-semibold">Historic Usage</h2>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                <HistoricSignInsPanel location={location} />
                <HistoricQueuePanel location={location} />
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/sign-in/$location/")({
  component: SignInIndexAppComponent,
  beforeLoad: ({ params: { location } }) => {
    try {
      const name = LocationNameSchema.parse(location.toUpperCase());
      return { name };
    } catch {
      throw redirect({to: "/sign-in/$location", params: { location: "MAINSPACE" } });
    }
  },
});
