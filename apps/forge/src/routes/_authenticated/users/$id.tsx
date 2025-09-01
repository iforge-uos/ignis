import { Temporal } from "@js-temporal/polyfill";
import { isDefinedError } from "@orpc/client";
import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent } from "@packages/ui/components/card";
import { Input } from "@packages/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@packages/ui/components/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { formatDuration } from "date-fns";
import { Activity, Calendar, Clock, Flame, ListStart, School, TrendingUp, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import DiscordIcon from "@/../public/icons/discord.svg?react";
import GitHubIcon from "@/../public/icons/github.svg?react";
import { UserAvatar } from "@/components/avatar";
import Title from "@/components/title";
import { orpc } from "@/lib/orpc";
import { cn, debounce } from "@/lib/utils";
import Analytics from "./-components/Analytics";
import Overview from "./-components/Overview";
import Timeline from "./-components/Timeline";
import Training from "./-components/Training";

const USER_TABS = ["overview", "training", "analytics"] as const;
const REP_TABS = ["teams"] as const;

export default function Component() {
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const { tab } = Route.useSearch();
  const [activeTab, setActiveTab] = useState(tab);
  const params = Route.useParams();

  const { data: user } = useSuspenseQuery(orpc.users.profile.get.queryOptions({ input: params }));
  console.log("Got user", user)
  const isRep = user.__typename === "users::Rep";

  const [displayName, setDisplayName] = useState(user.display_name);
  const [pronouns, setPronouns] = useState(user.pronouns ?? "");

  const { mutate: updateProfile } = useMutation({
    ...orpc.users.profile.edit.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.users.profile.get.queryKey({ input: user }) });
    },
    onError: (error) => {
      if (isDefinedError(error)) {
        if (error.code === "INPUT_VALIDATION_FAILED") {
          toast.error(error.message);
        }
      }
      console.error(error);
    },
  });

  const debouncedUpdateDisplayName = useCallback(
    debounce((newDisplayName: string) => {
      if (newDisplayName !== user.display_name && newDisplayName.trim()) {
        updateProfile({ id: user.id, display_name: newDisplayName });
      }
    }, 1000),
    [],
  );

  const debouncedUpdatePronouns = useCallback(
    debounce((newPronouns: string) => {
      if (newPronouns !== (user.pronouns ?? "")) {
        updateProfile({ id: user.id, pronouns: newPronouns });
      }
    }, 1000),
    [],
  );

  const completedTrainings = user.training.filter((t) => !t.in_person || t["@in_person_created_at"]);

  useEffect(() => {
    navigate({ search: { tab: activeTab } });
  }, [activeTab, navigate]);

  const totalHours = user.grouped_sign_ins.reduce((acc, day) => acc + day.value / 3600, 0);

  let longestStreak = 1;
  let currentStreak = 1;
  let previousDoy = 0;
  let previousDate: Temporal.PlainDate | undefined;
  const _end = user.grouped_sign_ins.at(0)?.date;
  let endStreak = _end ? Temporal.PlainDate.from(_end) : null;
  for (const entry of user.grouped_sign_ins) {
    const date = Temporal.PlainDate.from(entry.date);
    if (date.dayOfYear === 1) {
      previousDoy = 0;
    }
    if (date.dayOfYear === previousDoy + 1) {
      currentStreak += 1;
    } else {
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        endStreak = previousDate!;
      }
      currentStreak = 1;
    }
    previousDate = date;
    previousDoy = date.dayOfYear;
  }

  return (
    <>
      <Title prompt={`${user.display_name}'s Profile`} />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <UserAvatar user={user} className="w-36 h-36" />
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-baseline gap-3 mb-2">
                      <Input
                        value={displayName}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDisplayName(value);
                          debouncedUpdateDisplayName(value);
                        }}
                        className="!text-3xl font-bold !bg-transparent border-0 p-0 shadow-none h-auto outline-none min-w-0 max-w-none"
                        style={{
                          width: `${Math.max(displayName.length, 12)}ch`,
                        }}
                        placeholder="Display name"
                      />
                      <Input
                        value={pronouns}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPronouns(value);
                          debouncedUpdatePronouns(value);
                        }}
                        placeholder="No pronouns set"
                        className="!text-lg text-secondary-foreground !bg-transparent border-0 p-0 shadow-none h-auto outline-none min-w-0 max-w-none"
                        style={{
                          width: `${Math.max(pronouns.length || 15, 8)}ch`,
                        }}
                      />
                    </div>
                    <span className="text-secondary-foreground flex gap-2">
                      <a className="link-underline" href={`mailto:${user.email}@sheffield.ac.uk`}>
                        {user.email}@sheffield.ac.uk
                      </a>
                      <p className="select-none">{" • "}</p>@{user.username}
                      <p className="select-none">{" • "}</p>XXX-{user.ucard_number}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <Badge key={role.id} variant="secondary" className="text-sm">
                        <Users className="!size-4 mr-1" />
                        {role.name}
                      </Badge>
                    ))}
                    <Badge variant="secondary" className="text-sm">
                      <School className="!size-4 mr-1" />
                      {user.organisational_unit} Department
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-sm">
                          <Calendar className="!size-4 mr-1" />
                          Member since {user.created_at.getFullYear()}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        You joined the iForge{" "}
                        {formatDuration(
                          Temporal.Now.zonedDateTimeISO("UTC").since(
                            user.created_at.toTemporalInstant().toZonedDateTimeISO("UTC"),
                            {
                              largestUnit: "years",
                            },
                          ),
                          { format: ["years", "months"] },
                        )}{" "}
                        ago
                      </TooltipContent>
                    </Tooltip>
                    {user.frequent_customer && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-sm">
                            <ListStart className="!size-4 mr-1 rotate-180" />
                            Frequent Customer
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>You show up to the iForge more than most</TooltipContent>
                      </Tooltip>
                    )}
                    {longestStreak > 1 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-sm">
                            <Flame className="!size-4 mr-1" />
                            Streak {longestStreak} days
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          You have a daily streak of {longestStreak} which started on{" "}
                          {endStreak!.subtract({ days: longestStreak - 1 }).toLocaleString()}
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-sm">
                          <TrendingUp className="!size-4 mr-1" />
                          Top {100 - Math.round((user.dweller || 0) * 100)}%
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        You are in the {Math.round((user.dweller || 0) * 100)}% percentile for users time spent in the
                        iForge
                      </TooltipContent>
                    </Tooltip>
                    {user.integrations.map((integration) => (
                      <a
                        key={integration.platform}
                        href={
                          integration.platform === "DISCORD"
                            ? `https://discord.com/users/${integration.external_id}`
                            : integration.data.html_url
                        }
                      >
                        <Button variant="secondary" className="h-fit py-1">
                          {integration.platform === "GITHUB" ? (
                            <GitHubIcon className="!size-4 -ml-2 mr-1 dark:fill-white" />
                          ) : (
                            <DiscordIcon className="!size-4 -ml-2 mr-1 dark:fill-white" />
                          )}
                          {integration.platform === "DISCORD"
                            ? `Discord: ${integration.data.global_name}`
                            : `GitHub: ${integration.data.login}`}
                        </Button>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-md">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recent Visits</p>
                    <p className="text-2xl font-bold">{user.recent_sign_in_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Session</p>
                    <p className="text-2xl font-bold">{Math.round(totalHours / user.grouped_sign_ins.length)}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Trainings</p>
                    <p className="text-2xl font-bold">{completedTrainings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as typeof activeTab)}
                className="space-y-6"
              >
                <TabsList className={cn("grid w-full", isRep ? "grid-cols-4" : "grid-cols-3")}>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="training">Trainings</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  {isRep && <TabsTrigger value="teams">Teams</TabsTrigger>}
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Overview user={user} />
                </TabsContent>

                <TabsContent value="training">
                  <Training training={user.training} isRep={isRep} />
                </TabsContent>

                <TabsContent value="analytics">
                  <Analytics user={user} />
                </TabsContent>

                {isRep && (
                  <TabsContent value="teams">
                    <Timeline user={user} />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/users/$id")({
  loader: async ({ context, params }) =>
    context.queryClient.prefetchQuery(orpc.users.profile.get.queryOptions({ input: params })),
  validateSearch: z.object({ tab: z.literal([...USER_TABS, ...REP_TABS]).default("overview") }),
  component: Component,
  ssr: false,
});
