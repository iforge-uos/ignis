import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { Activity, Clock3, ExternalLink, ListChecks, ShieldCheck } from "lucide-react";
import MainspaceFloorPlanSvgMarkup from "@/../public/floorplans/mainspace-floor-plan.svg?raw";
import { activeLocationAtom } from "@/atoms/signInAppAtoms";
import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import BusyChart from "@/components/sign-in/BusyChart";
import CurrentSignInsPanel from "@/components/sign-in/CurrentSignInsPanel";
import FloorPlan from "@/components/sign-in/FloorPlan";
import HistoricSignInsPanel from "@/components/sign-in/HistoricSignInsPanel";
import Title from "@/components/title";
import { useUserRoles } from "@/hooks/useUserRoles";
import { orpc } from "@/lib/orpc";

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
  const activeLocation = useAtomValue(activeLocationAtom);
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

  const { data: locationData } = useQuery({
    ...orpc.locations.get.queryOptions({ input: { name: activeLocation } }),
    enabled: canViewDetailedUsage,
    staleTime: 5_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: occupancyForecast } = useQuery({
    ...orpc.locations.occupancyForecast.queryOptions({ input: { name: activeLocation } }),
    staleTime: 3_600_000,
    refetchInterval: 3_600_000,
    refetchOnWindowFocus: true,
  });

  const { data: tools } = useQuery({
    ...orpc.locations.tools.queryOptions({ input: { name: activeLocation } }),
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const inUseTools = tools?.filter((tool) => tool.use_count > 0).slice(0, 6) ?? [];
  const activeTools = tools?.reduce((count, tool) => count + tool.use_count, 0) ?? 0;
  const totalTools = tools?.reduce((count, tool) => count + tool.quantity, 0) ?? 0;

  return (
    <>
      <Title prompt="Sign In Dashboard" />
      <div className="p-4 mt-1">
        <ActiveLocationSelector />
        <div className="rounded-md border-2 p-4 space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-center md:text-left">Sign-in dashboard</h1>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4" />
              <h2 className="text-lg font-semibold">At a Glance</h2>
            </div>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
              <BusyChart data={occupancyForecast} />
              <Card>
                <CardHeader>
                  <CardTitle>Tool usage</CardTitle>
                  <CardDescription>Public aggregate usage from the current sign-in state.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Tools in use</div>
                      <div className="text-2xl font-semibold">{activeTools}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Tracked tools</div>
                      <div className="text-2xl font-semibold">{totalTools}</div>
                    </div>
                  </div>
                  {inUseTools.length > 0 ? (
                    <div className="space-y-2">
                      {inUseTools.map((tool) => (
                        <div
                          key={tool.name}
                          className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                        >
                          <span>{tool.name}</span>
                          <Badge variant="outline">
                            {tool.use_count}/{tool.quantity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tools are currently marked in use.</p>
                  )}
                </CardContent>
              </Card>
            </div>
            <FloorPlan
              svgMarkup={activeLocation === "MAINSPACE" ? MainspaceFloorPlanSvgMarkup : undefined}
              locationName={activeLocation}
              signIns={locationData?.sign_ins}
              tools={tools}
              canViewLiveUsage={canViewDetailedUsage}
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ListChecks className="size-4" />
              <h2 className="text-lg font-semibold">SignIn Related</h2>
            </div>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Fast paths for the most common sign-in workflows.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <Button asChild size="lg">
                    <Link to="/sign-in/actions/in">Start sign in</Link>
                  </Button>
                  <Button asChild size="lg" variant="warning">
                    <Link to="/sign-in/actions/enqueue">Queue yourself</Link>
                  </Button>
                  {canViewDetailedUsage && (
                    <Button asChild size="lg" variant="outline" className="sm:col-span-2">
                      <Link to="/sign-in/dashboard">
                        <ShieldCheck className="mr-2 size-4" />
                        Open rep dashboard
                      </Link>
                    </Button>
                  )}
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    The full inline UCard flow is still handled by the dedicated actions routes; this page now acts as
                    the live overview surface.
                  </p>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>
                    Operational links that still need to stay close to the sign-in workflow.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {resourceItems.map((item) => (
                    <div key={item.title} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <a href={item.externalLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="size-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock3 className="size-4" />
              <h2 className="text-lg font-semibold">Detailed</h2>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <CurrentSignInsPanel canViewDetailedUsage={canViewDetailedUsage} entries={locationData?.sign_ins} />
              <HistoricSignInsPanel canViewDetailedUsage={canViewDetailedUsage} locationName={activeLocation} />
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/sign-in/")({
  component: SignInIndexAppComponent,
});
