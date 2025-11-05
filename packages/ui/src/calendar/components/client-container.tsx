"use client";

import { CalendarAgendaView } from "@packages/ui/calendar/components/agenda-view/calendar-agenda-view";
import { DndProviderWrapper } from "@packages/ui/calendar/components/dnd/dnd-provider";
import { CalendarHeader } from "@packages/ui/calendar/components/header/calendar-header";
import { CalendarMonthView } from "@packages/ui/calendar/components/month-view/calendar-month-view";
import { CalendarDayView } from "@packages/ui/calendar/components/week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "@packages/ui/calendar/components/week-and-day-view/calendar-week-view";
import { CalendarYearView } from "@packages/ui/calendar/components/year-view/calendar-year-view";
import { useCalendar } from "@packages/ui/calendar/contexts/calendar-context";
import { getCalendarCells } from "@packages/ui/calendar/helpers";
import type { TCalendarView } from "@packages/ui/calendar/types";
import { isSameDay, parseISO } from "date-fns";
import React, { useMemo } from "react";

interface IProps {
  view: TCalendarView;
  editable?: boolean;
}

export function ClientContainer({ view, editable = true }: IProps) {
  const { selectedDate, selectedUserId, events } = useCalendar();

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventStartDate = parseISO(event.startDate);
      const eventEndDate = parseISO(event.endDate);

      if (view === "year") {
        const yearStart = new Date(selectedDate.getFullYear(), 0, 1);
        const yearEnd = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        const isInSelectedYear = eventStartDate <= yearEnd && eventEndDate >= yearStart;
        const isUserMatch = selectedUserId === "all" || event.user.id === selectedUserId;
        return isInSelectedYear && isUserMatch;
      }

      if (view === "month") {
        const cells = getCalendarCells(selectedDate);
        if (!cells || cells.length === 0) return false;
        const monthStart = cells[0]!.date;
        const monthEnd = cells[cells.length - 1]!.date;
        monthEnd.setHours(23, 59, 59, 999);

        const isInSelectedMonth = eventStartDate <= monthEnd && eventEndDate >= monthStart;
        const isUserMatch = selectedUserId === "all" || event.user.id === selectedUserId;
        return isInSelectedMonth && isUserMatch;
      }

      if (view === "agenda") {
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
        const isInSelectedMonth = eventStartDate <= monthEnd && eventEndDate >= monthStart;
        const isUserMatch = selectedUserId === "all" || event.user.id === selectedUserId;
        return isInSelectedMonth && isUserMatch;
      }

      if (view === "week") {
        const dayOfWeek = selectedDate.getDay();

        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const isInSelectedWeek = eventStartDate <= weekEnd && eventEndDate >= weekStart;
        const isUserMatch = selectedUserId === "all" || event.user.id === selectedUserId;
        return isInSelectedWeek && isUserMatch;
      }

      if (view === "day") {
        const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
        const dayEnd = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          23,
          59,
          59,
        );
        const isInSelectedDay = eventStartDate <= dayEnd && eventEndDate >= dayStart;
        const isUserMatch = selectedUserId === "all" || event.user.id === selectedUserId;
        return isInSelectedDay && isUserMatch;
      }
      return false;
    });
  }, [selectedDate, selectedUserId, events, view]);

  const singleDayEvents = filteredEvents.filter((event) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return isSameDay(startDate, endDate);
  });

  const multiDayEvents = filteredEvents.filter((event) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return !isSameDay(startDate, endDate);
  });

  // For year view, we only care about the start date
  // by using the same date for both start and end,
  // we ensure only the start day will show a dot
  const eventStartDates = useMemo(() => {
    return filteredEvents.map((event) => ({ ...event, endDate: event.startDate }));
  }, [filteredEvents]);

  return (
    <div className="overflow-hidden rounded-xl border">
      <CalendarHeader view={view} events={filteredEvents} editable={editable} />

      <DndProviderWrapper>
        {view === "day" && <CalendarDayView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} editable={editable}/>}
        {view === "month" && <CalendarMonthView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents}  editable={editable} />}
        {view === "week" && <CalendarWeekView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
        {view === "year" && <CalendarYearView allEvents={eventStartDates} />}
        {view === "agenda" && <CalendarAgendaView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
      </DndProviderWrapper>
    </div>
  );
}
