import type { SignInEntry } from "@packages/types/sign_in";
import { Badge } from "@packages/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { ScrollArea } from "@packages/ui/components/scroll-area";
import { formatDistanceToNow } from "date-fns";

type CurrentSignInsPanelProps = {
  canViewDetailedUsage: boolean;
  entries?: SignInEntry[];
};

export default function CurrentSignInsPanel({ canViewDetailedUsage, entries }: CurrentSignInsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current sign-ins</CardTitle>
        <CardDescription>Live sign-ins for the active location.</CardDescription>
      </CardHeader>
      <CardContent>
        {!canViewDetailedUsage ? (
          <p className="text-sm text-muted-foreground">Current sign-in details are limited to reps and admins.</p>
        ) : !entries || entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active sign-ins right now.</p>
        ) : (
          <ScrollArea className="h-96 pr-4">
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{entry.user.display_name}</p>
                      <p className="text-xs text-muted-foreground">{entry.reason.name}</p>
                    </div>
                    <Badge variant="outline">{formatDistanceToNow(entry.created_at.epochMilliseconds, { addSuffix: true })}</Badge>
                  </div>
                  {entry.tools.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {entry.tools.map((tool) => (
                        <Badge key={`${entry.id}-${tool}`} variant="secondary">{tool}</Badge>
                      ))}
                    </div>
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
