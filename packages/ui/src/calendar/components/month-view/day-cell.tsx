import { DroppableDayCell } from "@packages/ui/calendar/components/dnd/droppable-day-cell";
import { EventBullet } from "@packages/ui/calendar/components/month-view/event-bullet";
import { MonthEventBadge } from "@packages/ui/calendar/components/month-view/month-event-badge";
import { getMonthCellEvents } from "@packages/ui/calendar/helpers";
import type { ICalendarCell, IEvent } from "@packages/ui/calendar/interfaces";
import { cn } from "@packages/ui/lib/utils";
import { isToday, startOfDay } from "date-fns";
import React, { useMemo } from "react";

interface IProps {
  cell: ICalendarCell;
  events: IEvent[];
  eventPositions: Record<string, number>;
  editable?: boolean;
}

const MAX_VISIBLE_EVENTS = 3;

export function DayCell({ cell, events, eventPositions, editable = true }: IProps) {
  const { day, currentMonth, date } = cell;

  const cellEvents = useMemo(() => getMonthCellEvents(date, events, eventPositions), [date, events, eventPositions]);
  const isSunday = date.getDay() === 0;

  return (
    <DroppableDayCell cell={cell} editable={editable}>
      <div className={cn("flex h-full flex-col gap-1 border-l border-t py-1.5 lg:py-2", isSunday && "border-l-0")}>
        <span
          className={cn(
            "h-6 px-1 text-xs font-semibold lg:px-2",
            !currentMonth && "opacity-20",
            isToday(date) && "flex w-6 translate-x-1 items-center justify-center rounded-full bg-primary px-0 font-bold text-primary-foreground"
          )}
        >
          {day}
        </span>

        <div className={cn("flex h-6 gap-1 px-2 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0", !currentMonth && "opacity-50")}>
          {[0, 1, 2].map(position => {
            const event = cellEvents.find(e => e.position === position);
            const eventKey = event ? `event-${event.id}-${position}` : `empty-${position}`;

            return (
              <div key={eventKey} className="lg:flex-1">
                {event && (
                  <>
                    <EventBullet className="lg:hidden" event={event} editable={editable} />
                    <MonthEventBadge className="hidden lg:flex" event={event} cellDate={startOfDay(date)} editable={editable} />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {cellEvents.length > MAX_VISIBLE_EVENTS && (
          <p className={cn("h-4.5 px-1.5 text-xs font-semibold text-muted-foreground", !currentMonth && "opacity-50")}>
            <span className="sm:hidden">+{cellEvents.length - MAX_VISIBLE_EVENTS}</span>
            <span className="hidden sm:inline"> {cellEvents.length - MAX_VISIBLE_EVENTS} more...</span>
          </p>
        )}
      </div>
    </DroppableDayCell>
  );
}
