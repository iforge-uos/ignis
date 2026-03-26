import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@packages/ui/components/chart";
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

const config: ChartConfig = {
  current: {
    label: "Current occupancy",
    color: "var(--chart-1)",
  },
  projected: {
    label: "Projected occupancy",
    color: "var(--chart-2)",
  },
};

type BusyPoint = {
  label: string;
  current: number;
  projected: number;
  capacity: number;
  utilisation: number;
  projectedUtilisation: number;
};

type BusyChartProps = {
  data?: BusyPoint[];
};

export default function BusyChart({ data }: BusyChartProps) {
  const hasUsersInWindow = (point: BusyPoint) => point.current > 0 || point.projected > 0;

  const firstActiveIndex = data?.findIndex(hasUsersInWindow) ?? -1;
  const lastActiveIndex =
    firstActiveIndex === -1 || !data
      ? -1
      : data.length - 1 - [...data].reverse().findIndex(hasUsersInWindow);

  const chartData =
    !data || firstActiveIndex === -1 || lastActiveIndex === -1
      ? data
      : data.slice(firstActiveIndex, lastActiveIndex + 1);

  const nowPoint = data?.[new Date().getHours()] ?? data?.[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Space busyness</CardTitle>
        <CardDescription>Hourly sign-in chunks for today with prediction from last year's matching weekday.</CardDescription>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No occupancy forecast available.</p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>Now: {nowPoint?.current ?? 0}/{nowPoint?.capacity ?? 0}</span>
              <span>Current utilisation: {nowPoint?.utilisation ?? 0}%</span>
              <span>Peak projection: {Math.max(...data.map((point) => point.projected))}/{nowPoint?.capacity ?? 0}</span>
            </div>
            <ChartContainer config={config} className="h-72 w-full">
              <BarChart accessibilityLayer data={chartData} barGap={-16}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ReferenceLine y={nowPoint?.capacity ?? 0} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="current" fill="var(--color-current)" radius={6} barSize={16} />
                <Bar dataKey="projected" fill="var(--color-projected)" radius={6} barSize={16} fillOpacity={0.7} />
              </BarChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
