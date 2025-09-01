import { Temporal } from "@js-temporal/polyfill";
import { Datum, ResponsiveCalendar } from "@nivo/calendar";
import { SignInStat } from "@packages/types/users";
import { Button } from "@packages/ui/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@packages/ui/components/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@packages/ui/components/drawer";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@packages/ui/components/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import MediaQuery from "react-responsive";
import { LocationIcon } from "@/icons/Locations";
import { Procedures } from "@/types/router";
import { formatDuration } from "date-fns";

function createRoundedColorScale(data: SignInStat[]) {
  const maxValue = Math.max(...data.map((d) => d.value));

  const roundedMax = Math.ceil(maxValue / 1800) * 1800;

  const intervals = [
    0,
    Math.round((roundedMax * 0.2) / 1800) * 1800,
    Math.round((roundedMax * 0.4) / 1800) * 1800,
    Math.round((roundedMax * 0.6) / 1800) * 1800,
    Math.round((roundedMax * 0.8) / 1800) * 1800,
    roundedMax,
  ];

  const colors = ["var(--muted)", "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

  const colorScale = (value: number) => {
    for (let i = intervals.length - 1; i >= 0; i--) {
      if (value >= intervals[i]) {
        return colors[Math.min(i, colors.length - 1)];
      }
    }
    return colors[0];
  };

  return {colorScale, intervals};
}

type SignInDatum = Omit<Datum, "data"> & {
  data: Datum["data"] & Procedures["users"]["profile"]["get"]["grouped_sign_ins"][number];
};

function SignInTable({ datum }: { datum: SignInDatum | null }) {
  return (
    <Table>
      <TableHeader className="bg-accent rounded-md">
        <TableRow className="bg-accent rounded">
          <TableHead className="text-center">Location</TableHead>
          <TableHead className="text-center">Entered</TableHead>
          <TableHead className="text-center">Left</TableHead>
          <TableHead className="text-center">Duration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {datum?.data.sign_ins.map((sign_in) => {
          return (
            <Link key={sign_in.id} to="/sign-ins/$id" params={sign_in} className="contents">
              <TableRow className="hover:bg-accent hover:cursor-pointer" key={sign_in.id}>
                <TableCell className="flex justify-center">
                  <LocationIcon location={sign_in.location.name} tooltip={false} />
                </TableCell>
                <TableCell className="text-center">{sign_in.created_at.toLocaleTimeString()}</TableCell>
                <TableCell className="text-center">{sign_in.ends_at?.toLocaleTimeString() || "-"}</TableCell>
                <TableCell className="text-center">
                  {formatDuration(Temporal.Duration.from(sign_in.duration))}
                </TableCell>
              </TableRow>
            </Link>
          );
        })}
      </TableBody>
    </Table>
  );
}

const Entry = ({ day }: { day: string }) => {
  return <div className="bg-card p-1.5 rounded-md h-fit">{new Date(day).toLocaleDateString()}</div>;
};

const CustomLegend = ({ data }: { data: SignInStat[] }) => {
  const {colorScale, intervals} = createRoundedColorScale(data);

  return (
    <div className="flex items-center gap-4 px-6 -mb-10">
        {intervals.slice(0, intervals.length-1).map((interval) => (
          <div key={interval} className="flex flex-col items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: colorScale(interval) }}
            />
            <span className="text-xs text-muted-foreground">
              {formatDuration(Temporal.Duration.from({hours: Math.floor(interval / 3600), minutes: Math.floor((interval % 3600) / 60), seconds:Math.floor(interval % 60)})) || "0m"}
            </span>
          </div>
        ))}
    </div>
  );
};

export default function SignInChart({ data }: { data: SignInStat[] }) {
  const [open, setOpen] = React.useState(false);
  const [datum, setDatum] = React.useState<SignInDatum | null>(null);
  const years = Array.from(new Set(data.map((value) => Number.parseInt(value.day.split("-")[0])))).toSorted();
  const [activeYear, setActiveYear] = React.useState(years.at(-1)!);
  const yearsData = data.filter((data) => data.day.startsWith(activeYear.toString()));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{activeYear} Visits</CardTitle>
        <CardDescription>
          You visited the iForge on {yearsData.length} days and signed in {yearsData.flatMap((stat) => stat.sign_ins).length} times.
        </CardDescription>
      </CardHeader>
      <div>
        <style>
          {`
          #sign-in-chart g rect[x][y][width][height][style] {
            rx: var(--radius);
            stroke: none;
          }

          #sign-in-chart .calendar-legend-symbol {
            rx: calc(var(--radius) - 4px);
          }

          #sign-in-chart g text {
            font-size: 14px !important;
          }

          #sign-in-chart g[transform="translate(0,20)"] > g:first-child .calendar-legend-symbol {
            fill: var(--muted) !important;
          }
        `}
        </style>


        <div className="h-60" id="sign-in-chart">
        <CustomLegend data={yearsData} />
          <ResponsiveCalendar
            data={yearsData}
            from={`${activeYear}-01-01`}
            to={`${activeYear}-12-31`}
            colors={["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]}
            emptyColor="var(--muted)"
            legendFormat={formatDuration}
            dayBorderWidth={2}
            dayBorderColor="var(--card)"
            monthBorderColor="var(--card)"
            yearLegend={(() => {}) as any}
            margin={{ left: 24, right: 24, bottom: -80, top: -24 }}
            theme={{
              text: {
                fill: "var(--foreground)",
                fontFamily: "var(--font-sans), sans-serif",
              },
              tooltip: {
                container: {
                  background: "var(--background)",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-sans), sans-serif",
                },
              },
              labels: {
                text: {
                  fill: "var(--foreground)",
                  fontFamily: "var(--font-sans), sans-serif",
                },
              },
              legends: {
                text: {
                  fill: "var(--foreground)",
                  fontFamily: "var(--font-sans), sans-serif",
                },
              },
            }}
            legends={[]}
            tooltip={(props) => (props.value ? <Entry day={props.day} /> : undefined)}
            onMouseEnter={(_, event) => {
              event.currentTarget.style.cursor = "pointer"; // plouc/nivo#2276
            }}
            // @ts-ignore
            onClick={(datum: SignInDatum) => {
              if (!datum.data?.sign_ins) return;
              setOpen(true);
              setDatum(datum);
            }}
          />
        </div>

        <MediaQuery minWidth={768}>
          {(matches) => {
            const title = `Visits on ${datum?.date.toLocaleDateString()}`;
            return matches ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                  </DialogHeader>
                  <SignInTable datum={datum} />
                </DialogContent>
              </Dialog>
            ) : (
              <Drawer open={open} onOpenChange={setOpen}>
                <DrawerContent>
                  <DrawerHeader className="text-left">
                    <DrawerTitle>{title}</DrawerTitle>
                  </DrawerHeader>
                  <SignInTable datum={datum} />
                  <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                      <Button variant="outline">Close</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            );
          }}
        </MediaQuery>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem className="rounded-full">
            <PaginationPrevious
              className="rounded-full"
              disabled={activeYear === years[0]}
              onClick={() => setActiveYear((y) => y - 1)}
            />
          </PaginationItem>
          {years.map((year) => (
            <PaginationItem key={year}>
              <PaginationLink isActive={year === activeYear} onClick={() => setActiveYear(year)}>
                {year}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem className="rounded-full">
            <PaginationNext
              className="rounded-full"
              disabled={activeYear === years.at(-1)}
              onClick={() => setActiveYear((y) => y + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </Card>
  );
}
