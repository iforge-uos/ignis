import type { IEvent } from "@packages/ui/calendar/interfaces";
import { format } from "date-fns";

function formatDateForICS(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

export function generateICS(events: IEvent[]): string {
  const icsEvents = events
    .map(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      return [
        "BEGIN:VEVENT",
        `UID:${event.id}@yourdomain.com`,
        `DTSTAMP:${formatDateForICS(new Date())}`,
        `DTSTART:${formatDateForICS(startDate)}`,
        `DTEND:${formatDateForICS(endDate)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description}`,
        `LOCATION:${event.location || ""}`,
        "END:VEVENT",
      ].join("\n");
    })
    .join("\n");

  const icsContent = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Your Company//Your Product//EN", icsEvents, "END:VCALENDAR"].join("\n");

  return icsContent;
}

export function downloadICS(events: IEvent[]) {
  const icsContent = generateICS(events);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `calendar.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
