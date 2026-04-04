import { Badge } from "@packages/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { format } from "date-fns";
import { AlertTriangle, Ban, Clock, ShieldAlert } from "lucide-react";
import { Procedures } from "@/types/router";

type User = Procedures["users"]["profile"]["get"];
type Infraction = User["infractions"][number];

interface InfractionsProps {
  user: User;
}

function getInfractionTypeBadge(type: Infraction["type"]) {
  switch (type) {
    case "WARNING":
      return <Badge variant="secondary">Warning</Badge>;
    case "TEMP_BAN":
      return <Badge variant="destructive">Temporary Ban</Badge>;
    case "PERM_BAN":
      return <Badge variant="destructive">Permanent Ban</Badge>;
    case "RESTRICTION":
      return <Badge variant="outline">Restriction</Badge>;
    case "TRAINING_ISSUE":
      return <Badge variant="outline">Training Issue</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

export default function Infractions({ user }: InfractionsProps) {
  const infractions = user.infractions
    .sort((a, b) => b.created_at.epochMilliseconds - a.created_at.epochMilliseconds);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Infractions
        </CardTitle>
        <CardDescription>Disciplinary history for this user</CardDescription>
      </CardHeader>
      <CardContent>
        {infractions.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            No infractions recorded.
          </div>
        ) : (
          <div className="space-y-3">
            {infractions.map((infraction) => {
              const endsAt = infraction.duration ? infraction.created_at.add(infraction.duration) : null;

              return (
                <div key={infraction.id} className="rounded-md border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    {getInfractionTypeBadge(infraction.type)}
                    <Badge variant={infraction.resolved ? "secondary" : "destructive"}>
                      {infraction.resolved ? "Resolved" : "Active"}
                    </Badge>
                    {endsAt ? (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Ends {format(endsAt.epochMilliseconds, "PPP")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Ban className="h-3 w-3" />
                        No expiry
                      </Badge>
                    )}
                  </div>

                  <p className="mt-3 text-sm">{infraction.reason}</p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Added on {format(infraction.created_at.epochMilliseconds, "PPP p")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
