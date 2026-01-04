import { Temporal } from "@js-temporal/polyfill";
import { Badge } from "@packages/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import {
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine,
  Timeline as TimelinePrimitive,
} from "@packages/ui/components/timeline";
import { format } from "date-fns";
import { Crown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Procedures } from "@/types/router";

interface TeamHistoryProps {
  user: Procedures["users"]["profile"]["get"];
}

export default function Timeline({ user }: TeamHistoryProps) {
  if (user.__typename !== "users::Rep" || !user.teams) {
    return null;
  }

  const now = Temporal.Now.zonedDateTimeISO("UTC");

  const events = [
    {
      id: `${user.id}-user-creation`,
      type: "user" as const,
      teamName: "iForge User",
      date: user.created_at,
      endDate: null,
      isActive: true,
    },
    ...user.teams.flatMap((team) => {
      const events = [];

      // Team membership event
      const membershipEvent = {
        id: `${team.id}-membership`,
        type: "membership" as const,
        teamName: team.name,
        date: team["@created_at"]!,
        endDate: team["@ends_at"] ?? null,
        isActive: !team["@ends_at"] || Temporal.ZonedDateTime.compare(team["@ends_at"], now) > 0,
      };
      events.push(membershipEvent);

      // TODO: Re-enable leadership events when we have data (this requires the admin dashboard for promoting team leads)
      // const lead = team["@team_lead"]?.[0];
      // if (lead) {
      //   const leadershipEvent = {
      //     id: `${team.id}-leadership`,
      //     type: "leadership" as const,
      //     teamName: `${team.name} Team Lead`,
      //     date: lead.created_at,
      //     endDate: lead.ends_at && Temporal.ZonedDateTime.compare(lead.ends_at, now) < 0 ? null : lead.ends_at,
      //     isActive: Temporal.ZonedDateTime.compare(lead.ends_at ?? now, now) > 0,
      //   };
      //   events.push(leadershipEvent);
      // }

      return events;
    }),
  ].sort((a, b) => Temporal.ZonedDateTime.compare(b.date, a.date)); // sort desc

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team History
        </CardTitle>
        <CardDescription>Your team memberships and leadership roles over time</CardDescription>
      </CardHeader>
      <CardContent>
        <TimelinePrimitive>
          {events.map((event, index) => {
            const isLastEvent = index === events.length - 1;

            return (
              <TimelineItem key={event.id} status={event.isActive ? "default" : "done"}>
                <TimelineHeading side="right">
                  <div className="flex items-center gap-2 font-medium">{event.teamName}</div>
                </TimelineHeading>
                <TimelineDot status={event.isActive ? "current" : "done"} />
                <TimelineContent side="right">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={event.type === "leadership" ? "default" : "secondary"} className="text-xs">
                        {event.type === "leadership" ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            {event.isActive ? "Promoted to" : "Was"} Team Lead
                          </>
                        ) : (
                          <>
                            <Users className="w-3 h-3 mr-1" />
                            {event.teamName === "iForge" ? "Joined iForge" : event.isActive ? "Joined" : "Was Member"}
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">
                        {format(event.date.epochMilliseconds, "PPP")}
                      </span>
                      {" → "}
                      <span className={cn("font-medium", event.isActive ? "text-green-600" : "")}>
                        {event.isActive
                          ? "Present"
                          : format(event.endDate!.epochMilliseconds, "PPP")}
                      </span>
                    </p>
                  </div>
                </TimelineContent>
                {!isLastEvent && <TimelineLine done={!event.isActive} />}
              </TimelineItem>
            );
          })}
        </TimelinePrimitive>
      </CardContent>
    </Card>
  );
}
