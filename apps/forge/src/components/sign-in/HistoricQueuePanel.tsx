import { Yielded } from "@packages/types";
import { Badge } from "@packages/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { ScrollArea } from "@packages/ui/components/scroll-area";
import { format } from "date-fns";
import { Procedures } from "/src/types/router";
import { UserAvatar } from "../avatar";

type HistoricQueuePanelProps = {
  location: Yielded<Procedures["locations"]["get"]> | undefined;
};

export default function HistoricQueuePanel({ location }: HistoricQueuePanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historic queue</CardTitle>
        <CardDescription>Most recent twenty queue entries for the active location.</CardDescription>
      </CardHeader>
      <CardContent>
        {location?.historic_queue.length === 0 ? (
          <p className="text-sm text-muted-foreground">No historic queue entries.</p>
        ) : (
          <ScrollArea className="h-96 pr-4">
            <div className="space-y-3">
              {location?.historic_queue.map((entry) => (
                <div
                  key={`${entry.user.display_name}-${entry.created_at.epochMilliseconds}`}
                  className="rounded-lg border p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 items-center">
                      <UserAvatar user={entry.user} />
                      <p className="font-medium">{entry.user.display_name}</p>
                    </div>
                    <Badge variant="outline">{format(entry.created_at.epochMilliseconds, "dd MMM, HH:mm")}</Badge>
                  </div>
                  {entry.notified_at && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Notified at {format(entry.notified_at.epochMilliseconds, "dd MMM, HH:mm")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
