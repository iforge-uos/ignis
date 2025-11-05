
import { EditEventDialog } from "@packages/ui/calendar/components/dialogs/edit-event-dialog";
import type { IEvent } from "@packages/ui/calendar/interfaces";
import { downloadICS } from "@packages/ui/calendar/lib/ics";
import { Button } from "@packages/ui/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@packages/ui/components/dialog";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User } from "lucide-react";
import React from "react";

interface IProps {
  event: IEvent;
  children: React.ReactNode;
  editable?: boolean;
}

function formatLocation(location: string) {
  if (location.startsWith("iForge Makerspace")) {
    return "iForge Mainspace in The Diamond"
  } else if (location.startsWith("iForge Heartspace")) {
    return "iForge Heartspace in the Engineering Heartspace"
  }
  return location
}

export function EventDetailsDialog({ event, children, editable = true }: IProps) {
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  // Example location field, fallback to empty string if not present
  const location = event.location || "";
  // Google Maps search link
  const googleMapsUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    : "";

  const handleAddToCalendar = () => {
    downloadICS([event]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <User className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Responsible</p>
              <p className="text-sm text-muted-foreground">{event.user.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Start Date</p>
              <p className="text-sm text-muted-foreground">{format(startDate, "MMM d, yyyy H:mm")}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">End Date</p>
              <p className="text-sm text-muted-foreground">{format(endDate, "MMM d, yyyy H:mm")}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Text className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          </div>

          {location && (
            <div className="flex items-start gap-2">
              <Text className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="link-underline text-primary">
                    {formatLocation(location)}
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {editable && (
            <EditEventDialog event={event}>
              <Button type="button" variant="outline">
                Edit
              </Button>
            </EditEventDialog>
          )}
          <Button type="button" variant="default" onClick={handleAddToCalendar}>
            Add to Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
