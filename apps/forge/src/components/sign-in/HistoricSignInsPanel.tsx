import type { LocationName } from "@packages/types/sign_in";
import { Badge } from "@packages/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import DatePickerWithRange from "@packages/ui/components/date-picker-with-range";
import { ScrollArea } from "@packages/ui/components/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, format, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { orpc } from "@/lib/orpc";

type HistoricSignInsPanelProps = {
  canViewDetailedUsage: boolean;
  locationName: LocationName;
};

export default function HistoricSignInsPanel({ canViewDetailedUsage, locationName }: HistoricSignInsPanelProps) {
  const today = new Date();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfDay(today),
    to: endOfDay(today),
  });

  const { data, isLoading } = useQuery({
    ...orpc.locations.signIns.historic.queryOptions({
      input: {
        name: locationName,
        offset: 0,
        limit: 100,
      },
    }),
    enabled: canViewDetailedUsage,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const start = date?.from?.getTime() ?? Number.NEGATIVE_INFINITY;
    const end = date?.to?.getTime() ?? Number.POSITIVE_INFINITY;
    return data.filter((entry) => {
      const ts = entry.created_at.epochMilliseconds;
      return ts >= start && ts <= end;
    });
  }, [data, date]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historic sign-ins</CardTitle>
        <CardDescription>Recent sign-in history for the active location.</CardDescription>
      </CardHeader>
      <CardContent>
        {!canViewDetailedUsage ? (
          <p className="text-sm text-muted-foreground">Historic sign-in details are limited to reps and admins.</p>
        ) : (
          <div className="space-y-4">
            <DatePickerWithRange date={date} setDate={setDate} />
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading sign-in history…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No historic sign-ins in the selected range.</p>
            ) : (
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-3">
                  {filtered.map((entry) => (
                    <div key={entry.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{entry.user.display_name}</p>
                          <p className="text-xs text-muted-foreground">{entry.reason.name}</p>
                        </div>
                        <Badge variant="outline">{format(entry.created_at.epochMilliseconds, "dd MMM, HH:mm")}</Badge>
                      </div>
                      {entry.tools.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {entry.tools.map((tool) => (
                            <Badge key={`${entry.id}-${tool.name}`} variant="secondary">{tool.name}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
