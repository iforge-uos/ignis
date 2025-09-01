import { Temporal } from "@js-temporal/polyfill";
import { sign_in } from "@packages/db/interfaces";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@packages/ui/components/chart";
import { Progress } from "@packages/ui/components/progress";
import { format } from "date-fns";
import { Area, AreaChart, Legend, Pie, PieChart, XAxis, YAxis } from "recharts";
import { LocationIcon } from "@/icons/Locations";
import { counter, toTitleCase } from "@/lib/utils";
import { Procedures } from "@/types/router";
import SignInChart from "../../_reponly/sign-in/dashboard/-components/SignInChart";
import { formatReason } from "@/lib/utils/sign-in";

type SignIns = Procedures["users"]["profile"]["get"]["grouped_sign_ins"];

interface UserAnalyticsProps {
  user: Procedures["users"]["profile"]["get"];
}

function* processActivityByMonth(groupedSignIns: SignIns) {
  if (!groupedSignIns.at(0)?.sign_ins) return;

  const currentDay = groupedSignIns[0].sign_ins[0].created_at;
  let currentMonth = format(currentDay, "MMM y");
  let monthActivity = { month: currentMonth, duration: 0, visits: 0 };
  for (const { sign_ins } of groupedSignIns) {
    const day = sign_ins[0].created_at;
    const month = format(day, "MMM y");
    if (month !== currentMonth) {
      yield {...monthActivity, duration: Math.round(monthActivity.duration)};
      currentMonth = month;
      monthActivity = { month, duration: 0, visits: 0 };
    }

    monthActivity.duration += sign_ins.reduce(
      (sum, signIn) => sum + Temporal.Duration.from(signIn.duration).total("hours"),
      0,
    );
    monthActivity.visits += sign_ins.length;
  }
}

const toolConfig: ChartConfig = {
  usage: {
    label: "Usage",
  },
};

const reasonConfig: ChartConfig = {
  count: {
    label: "Count",
  },
};

const activityConfig: ChartConfig = {
  duration: {
    label: "Hours",
    color: "var(--chart-1)",
  },
  visits: {
    label: "Visits",
    color: "var(--chart-2)",
  },
};

export default function UserAnalytics({ user }: UserAnalyticsProps) {
  const locationUsage = user.grouped_sign_ins
    .flatMap((day) => day.sign_ins)
    .reduce((acc, { duration, location }) => {
      const durationInSeconds = Temporal.Duration.from(duration).total("seconds");
      const currentDuration = acc.get(location.name) ?? 0;
      return acc.set(location.name, currentDuration + durationInSeconds);
    }, new Map<sign_in.LocationName, number>());

  const totalLocationTime = locationUsage.values().reduce((acc, duration) => acc + duration, 0);

  const tools = user.grouped_sign_ins.flatMap((entry) => entry.sign_ins.flatMap((sign_in) => sign_in.tools.map(t => t.name)));
  const toolData = Object.entries(counter(tools))
    .map(([tool, usage]) => ({ tool, usage }))
    .sort((a, b) => b.usage - a.usage) // sort desc
    .slice(0, 6);

  const reasons = user.grouped_sign_ins.flatMap((entry) => entry.sign_ins.map((s) => formatReason(s.reason)));
  const reasonData = Object.entries(counter(reasons))
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count) // sort desc
    .slice(0, 6);

  const activityChartData = processActivityByMonth(user.grouped_sign_ins).toArray();

  toolData.forEach((item, index) => {
    toolConfig[item.tool] = {
      label: item.tool,
      color: `var(--chart-${(index % 10) + 1})`,
    };
  });

  reasonData.forEach((item, index) => {
    reasonConfig[item.reason] = {
      label: item.reason,
      color: `var(--chart-${(index % 10) + 1})`,
    };
  });

  const toolChartData = toolData.map((item) => ({
    ...item,
    fill: toolConfig[item.tool]?.color || `var(--chart-1)`,
  }));

  const reasonChartData = reasonData.map((item) => ({
    ...item,
    fill: reasonConfig[item.reason]?.color || `var(--chart-1)`,
  }));

  return (
    <>
      <div className="grid grid-cols-1 gap-6 mb-6">
        <SignInChart data={user.grouped_sign_ins} />
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>Your iForge usage trends by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityConfig} className="h-[200px] w-full">
              <AreaChart data={activityChartData}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value} hours spent`, null]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="duration"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Location Usage</CardTitle>
            <CardDescription>Time spent in different spaces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationUsage
                .entries()
                .toArray()
                .map(([location, duration]) => {
                  const percentage = Math.round((duration / totalLocationTime) * 100);
                  return (
                    <div key={location}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-1">
                          <LocationIcon location={location} />
                          <span className="font-medium">{toTitleCase(location)}</span>
                        </div>
                        <span className="text-muted-foreground">{percentage}%</span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Tools Used</CardTitle>
            <CardDescription>Your most used tools in the iForge</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={toolConfig} className="mx-auto aspect-square lg:min-h-[200px] xl:min-h-[350px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={toolChartData} dataKey="usage" nameKey="tool" innerRadius={35} />
                <Legend
                  content={({ payload }) => (
                    <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-full">
                      {payload?.slice(0, 6).map((entry) => (
                        <div key={entry.value} className="flex items-center gap-1 text-xs">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="truncate max-w-[80px]" title={entry.value}>
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Visit Reasons</CardTitle>
            <CardDescription>Why you come to the iForge</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={reasonConfig} className="mx-auto aspect-square lg:min-h-[200px] xl:min-h-[350px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={reasonChartData} dataKey="count" nameKey="reason" innerRadius={35} />
                <Legend
                  content={({ payload }) => (
                    <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-full">
                      {payload?.slice(0, 6).map((entry) => (
                        <div key={entry.value} className="flex items-center gap-1 text-xs">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="truncate max-w-[80px]" title={entry.value}>
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
