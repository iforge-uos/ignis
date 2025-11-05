// import Link from "next/link";

import { AddEventDialog } from "@packages/ui/calendar/components/dialogs/add-event-dialog";
import { DateNavigator } from "@packages/ui/calendar/components/header/date-navigator";
import { TodayButton } from "@packages/ui/calendar/components/header/today-button";

import { UserSelect } from "@packages/ui/calendar/components/header/user-select";
import { useCalendar } from "@packages/ui/calendar/contexts/calendar-context.tsx";
import type { IEvent } from "@packages/ui/calendar/interfaces";
import { downloadICS } from "@packages/ui/calendar/lib/ics";
import type { TCalendarView } from "@packages/ui/calendar/types";
import { Button } from "@packages/ui/components/button";
import { CalendarRange, Columns, Grid2x2, Grid3x3, List, Plus } from "lucide-react";
import React from "react";

interface IProps {
  view: TCalendarView;
  events: IEvent[];
  editable?: boolean;
}

export function CalendarHeader({ view, events, editable = true }: IProps) {
  const { googleCalendarId } = useCalendar();

  const handleAddAllToCalendar = () => {
    if (googleCalendarId) {
      const url = `https://calendar.google.com/calendar/u/0/r?cid=${googleCalendarId}`;
      window.open(url, "_blank");
    } else {
      downloadICS(events);
    }
  };

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton />
        <DateNavigator view={view} events={events} />
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
          {/* <div className="inline-flex first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none">
            <Button asChild aria-label="View by day" size="icon" variant={view === "day" ? "default" : "outline"} className="rounded-r-none [&_svg]:size-5">
              <Link href="/day-view">
                <List strokeWidth={1.8} />
               </Link>
            </Button>

            <Button
              asChild
              aria-label="View by week"
              size="icon"
              variant={view === "week" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
            >
              <Link href="/week-view">
                <Columns strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by month"
              size="icon"
              variant={view === "month" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
            >
              <Link href="/month-view">
                <Grid2x2 strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by year"
              size="icon"
              variant={view === "year" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
            >
              <Link href="/year-view">
                <Grid3x3 strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by agenda"
              size="icon"
              variant={view === "agenda" ? "default" : "outline"}
              className="-ml-px rounded-l-none [&_svg]:size-5"
            >
              <Link href="/agenda-view">
                <CalendarRange strokeWidth={1.8} />
              </Link>
            </Button>
          </div> */}

          <UserSelect />
        </div>
        <div className="flex w-full items-center gap-1.5">
          {editable && (
            <AddEventDialog>
              <Button className="w-full sm:w-auto">
                <Plus />
                Add Event
              </Button>
            </AddEventDialog>
          )}
          <Button className="w-full sm:w-auto" onClick={handleAddAllToCalendar}>
            <Plus />
            Follow
          </Button>
        </div>
      </div>
    </div>
  );
}
