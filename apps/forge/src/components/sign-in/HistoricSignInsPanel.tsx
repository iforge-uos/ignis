import { Badge } from "@packages/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { ScrollArea } from "@packages/ui/components/scroll-area";
import { format } from "date-fns";
import { Procedures } from "/src/types/router";
import { Yielded } from "@packages/types";
import { UserAvatar } from "../avatar";

type HistoricSignInsPanelProps = {
  location: Yielded<Procedures["locations"]["get"]> | undefined;
};

export default function HistoricSignInsPanel({ location }: HistoricSignInsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historic sign-ins</CardTitle>
        <CardDescription>Recent sign-in history for the active location.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {location?.historic_sign_ins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No historic sign-ins available.</p>
          ) : (
            <ScrollArea className="h-96 pr-4">
              <div className="space-y-3">
                {/* TODO these should link to the full sign ins */}
                {location?.historic_sign_ins.map((entry) => (
                  <div key={entry.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 items-center">
                        <UserAvatar user={entry.user} />
                        <div>
                          <p className="font-medium">{entry.user.display_name}</p>
                          <p className="text-xs text-muted-foreground">{entry.reason.name}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{format(entry.created_at.epochMilliseconds, "dd MMM, HH:mm")}</Badge>
                    </div>
                    {entry.tools.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {entry.tools.map((tool) => (
                          <Badge key={`${entry.id}-${tool.name}`} variant="secondary">
                            {tool.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
