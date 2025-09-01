import { Temporal } from "@js-temporal/polyfill";
import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine,
} from "@packages/ui/components/timeline";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { formatDuration } from "date-fns";
import { Activity, Award, Calendar, Clock, CreditCard, InfoIcon, Plus, Users, Wallet } from "lucide-react";
import { LocationIcon } from "@/icons/Locations";
import { toTitleCase } from "@/lib/utils";
import { getTrainingCompletionStatus } from "@/lib/utils/training";
import { Procedures } from "@/types/router";
import { SignInReason } from "../../_reponly/sign-in/actions/-components/SignInReason";

type User = Procedures["users"]["profile"]["get"];

interface UserAnalyticsProps {
  user: User;
}

type Training = User["training"][number];
type TrainingWithStatus = Training & { _isCompleted: boolean };

const generateRandomHash = () => {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase(),
  ).join("");
};

const handleTopUp = (user: User) => {
  // ...please enter the last part only
  // e.g. for “Van Der Vaart”, enter “Vaart” or for “Garcia Fernandez-Mendoza”, enter “Fernandez-Mendoza”.
  const lastName = user.last_name?.split(" ").at(-1) || "";

  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://onlinepayments.shef.ac.uk/papercut";
  form.target = "_blank"; // Open in new tab

  const fields = {
    username: user.username,
    lastname: lastName,
    tandc: "1",
    [generateRandomHash()]: generateRandomHash(),
    token: "",
  };

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

// table in Training.tsx
// Functions moved to @/lib/training-utils.ts for reusability

export default function UserOverview({ user }: UserAnalyticsProps) {
  const allSignIns = user.grouped_sign_ins.flatMap((signIn) => signIn.sign_ins);
  const isRep = user.__typename === "users::Rep";

  // Filter and sort completed trainings by completion date (most recent first)
  const completedTrainings: Training[] = user.training
    .filter((t) => {
      const status = getTrainingCompletionStatus(user, t);
      return status.isCompleted;
    })
    .sort((a, b) => {
      const statusA = getTrainingCompletionStatus(user, a);
      const statusB = getTrainingCompletionStatus(user, b);
      return statusB.completionDate.getTime() - statusA.completionDate.getTime();
    });

  // Filter started but not completed trainings
  const inProgressTrainings: Training[] = user.training
    .filter((training) => {
      const status = getTrainingCompletionStatus(user, training);
      return status.isStarted && !status.isCompleted;
    })
    .sort((a, b) => {
      const statusA = getTrainingCompletionStatus(user, a);
      const statusB = getTrainingCompletionStatus(user, b);
      return statusB.lastActivityDate.getTime() - statusA.lastActivityDate.getTime();
    });

  // Combine completed and in-progress trainings for timeline
  const allRelevantTrainings: TrainingWithStatus[] = [
    ...completedTrainings.map((t) => ({ ...t, _isCompleted: true as const })),
    ...inProgressTrainings.map((t) => ({ ...t, _isCompleted: false as const })),
  ].sort((a, b) => {
    const statusA = getTrainingCompletionStatus(user, a);
    const statusB = getTrainingCompletionStatus(user, b);
    const dateA = a._isCompleted ? statusA.completionDate : statusA.lastActivityDate;
    const dateB = b._isCompleted ? statusB.completionDate : statusB.lastActivityDate;
    return dateB.getTime() - dateA.getTime();
  });

  const supervisableTrainings: Training[] = isRep
    ? user.training.filter((t) => (user as any).supervisable_training?.includes(t.id))
    : [];

  return (
    <div className="space-y-4">
      <Card className="shadow-sm gap-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-4 w-4 text-primary" />
                Account Balance & Cost Centers
              </CardTitle>
              <CardDescription>Your current balance and available funding sources</CardDescription>
            </div>
            <div>
              <div className="min-w-[280px]">
                <div className="gap-4 grid col-end-2">
                  <div className="col-span-2 flex items-center gap-3 text-lg">
                    <CreditCard className="size-6" />
                    Balance
                  </div>
                  {user.balance && (
                    <span className="text-4xl font-bold text-primary">
                      {user.balance > 0 ? `£${(user.balance).toFixed(2)}` : "N/A"}
                    </span>
                  )}
                  {!user.balance && <span className="text-2xl font-bold text-primary">
                      {user.balance > 0 ? `£${(user.balance).toFixed(2)}` : "Not found"}
                    </span>}

                  <Button onClick={() => handleTopUp(user)} className="w-full gap-2" size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                    Top Up
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <h4 className="font-medium text-sm">Your Cost Centers</h4>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="size-4 hover:cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  These are modules/clubs that have an agreement in place with the iForge for manufacturing and
                  purchasing materials
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-wrap gap-2 max-h-32">
              {user.cost_centers && user.cost_centers.length > 0 ? (
                user.cost_centers.map((center) => (
                  <Tooltip key={center.name}>
                    <TooltipTrigger asChild>
                      <Badge
                        className="px-3 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors cursor-pointer border-muted-foreground/20"
                        variant="secondary"
                      >
                        {center.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-sm">{center.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))
              ) : (
                <div className="flex flex-col text-muted-foreground w-full">
                  <p className="font-bold">No cost centers available</p>
                  <p className="text-sm">Have a word with a Rep if you think you are missing from one</p>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid - Training and Activity Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Training Progress Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-4 w-4 text-primary" />
              Recent Training Progress
            </CardTitle>
            <CardDescription className="text-sm">
              Your latest equipment certifications and qualifications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {allRelevantTrainings.length > 0 ? (
              <Timeline>
                {allRelevantTrainings.slice(0, 6).map((training, index) => (
                  <TimelineItem key={training.id} status={training._isCompleted ? "done" : "default"}>
                    <TimelineHeading side="right" className="text-md font-medium">
                      {training.name}
                    </TimelineHeading>
                    <TimelineDot status={training._isCompleted ? "done" : "current"} />
                    <TimelineContent side="right" className="pb-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{training.description}</p>

                      {/* Date - completion or last activity */}
                      <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {training._isCompleted
                          ? `Completed ${getTrainingCompletionStatus(user, training).completionDate.toLocaleDateString()}`
                          : `Last activity ${getTrainingCompletionStatus(user, training).lastActivityDate.toLocaleDateString()}`}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1">
                        {training.locations.slice(0, 2).map((location) => (
                          <Badge variant="outline" className="text-sm py-0" key={location}>
                            <LocationIcon className="w-3 h-3 mr-1" location={location} tooltip={false} />
                            {toTitleCase(location)}
                          </Badge>
                        ))}
                        {training.locations.length > 2 && (
                          <Badge variant="outline" className="text-sm py-0">
                            +{training.locations.length - 2}
                          </Badge>
                        )}
                        {training.compulsory && (
                          <Badge variant="destructive" className="text-sm py-0">
                            Required
                          </Badge>
                        )}
                        {training._isCompleted && supervisableTrainings.some((st) => st.id === training.id) && (
                          <Badge variant="secondary" className="text-sm py-0">
                            <Users className="w-3 h-3 mr-1" />
                            Can Supervise
                          </Badge>
                        )}
                        {!training._isCompleted && (
                          <Badge variant="outline" className="text-sm py-0 border-orange-300 text-orange-700">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </TimelineContent>
                    {index < allRelevantTrainings.slice(0, 6).length - 1 && (
                      <TimelineLine done={training._isCompleted} />
                    )}
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No training records found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-md">Your latest visits and workspace usage</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {allSignIns.length > 0 ? (
              <div className="space-y-3">
                {allSignIns.slice(0, 8).map((signIn) => (
                  <div
                    key={signIn.id}
                    className="flex items-start gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <LocationIcon className="h-4 w-4 text-muted-foreground" location={signIn.location.name} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Header with location and duration */}
                      <div className="flex justify-between gap-2">
                        <span className="font-medium text-md truncate">{toTitleCase(signIn.location.name)}</span>
                        <Badge variant="outline" className="text-sm flex-shrink-0 py-0">
                          {formatDuration(Temporal.Duration.from(signIn.duration))}
                        </Badge>
                      </div>

                      {/* Sign in reason */}
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground mr-1">Reason:</span>
                        <SignInReason reason={signIn.reason} />
                      </div>

                      {/* Tools used */}
                      {signIn.tools && signIn.tools.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-sm text-muted-foreground mr-1">Tools:</span>
                          {signIn.tools.slice(0, 4).map((tool) => (
                            <Badge key={tool} variant="secondary" className="text-sm py-0">
                              {tool}
                            </Badge>
                          ))}
                          {signIn.tools.length > 4 && (
                            <Badge variant="outline" className="text-sm py-0">
                              +{signIn.tools.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Date and time */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {signIn.created_at.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {signIn.created_at.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No recent activity found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
