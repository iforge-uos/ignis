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
import { Crown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Procedures } from "@/types/router";

interface TeamHistoryProps {
  user: Procedures["users"]["profile"]["get"];
}

type TimelineEvent = {
  id: string;
  type: "membership" | "leadership" | "user";
  teamName: string;
  date: Date;
  endDate: Date | null; // null if future
  isActive: boolean;
};

export default function Timeline({ user }: TeamHistoryProps) {
  if (user.__typename !== "users::Rep" || !user.teams) {
    return null;
  }

  const now = new Date();

  const events: TimelineEvent[] = [
    {
      id: `${user.id}-user-creation`,
      type: "user",
      teamName: "iForge User",
      date: user.created_at,
      isActive: true,
    },
    ...user.teams.flatMap((team) => {
      const events: TimelineEvent[] = [];

      // Team membership event
      const membershipEvent: TimelineEvent = {
        id: `${team.id}-membership`,
        type: "membership",
        teamName: team.name,
        date: team["@created_at"]!,
        endDate: team["@ends_at"],
        isActive: !team["@ends_at"] || team["@ends_at"] > now,
      };
      events.push(membershipEvent);

      const lead = team["@team_lead"];
      if (lead) {
        const leadershipEvent: TimelineEvent = {
          id: `${team.id}-leadership`,
          type: "leadership",
          teamName: `${team.name} Team Lead`,
          date: lead.created_at,
          endDate: lead.ends_at && lead.ends_at  < now ? null : lead.ends_at,
          isActive: (lead.ends_at ?? now) > now,
        };
        events.push(leadershipEvent);
      }

      return events;
    }),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()); // sort desc

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
                      <span className="font-medium">{event.date.toLocaleDateString()}</span>
                          {" → "}
                          <span className={cn("font-medium", event.isActive ? "text-green-600" : "")}>
                            {event.isActive ? "Present" : event.endDate!.toLocaleDateString()}
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
