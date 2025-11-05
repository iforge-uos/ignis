"use client";

import { ItemTypes } from "@packages/ui/calendar/components/dnd/draggable-event";
import { useUpdateEvent } from "@packages/ui/calendar/hooks/use-update-event";
import type { ICalendarCell, IEvent } from "@packages/ui/calendar/interfaces";

import { cn } from "@packages/ui/lib/utils";
import { differenceInMilliseconds, parseISO } from "date-fns";
import { useDrop } from "react-dnd";

interface DroppableDayCellProps {
  cell: ICalendarCell;
  children: React.ReactNode;
  editable?: boolean;
}

export function DroppableDayCell({ cell, children, editable = true }: DroppableDayCellProps) {
  const { updateEvent } = useUpdateEvent();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.EVENT,
      canDrop: () => editable,
      drop: (item: { event: IEvent }) => {
        const droppedEvent = item.event;

        const eventStartDate = parseISO(droppedEvent.startDate);
        const eventEndDate = parseISO(droppedEvent.endDate);

        const eventDurationMs = differenceInMilliseconds(eventEndDate, eventStartDate);

        const newStartDate = new Date(cell.date);
        newStartDate.setHours(eventStartDate.getHours(), eventStartDate.getMinutes(), eventStartDate.getSeconds(), eventStartDate.getMilliseconds());
        const newEndDate = new Date(newStartDate.getTime() + eventDurationMs);

        updateEvent({
          ...droppedEvent,
          startDate: newStartDate.toISOString(),
          endDate: newEndDate.toISOString(),
        });

        return { moved: true };
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [cell.date, updateEvent]
  );

  return (
    <div ref={drop as unknown as React.RefObject<HTMLDivElement>} className={cn(isOver && canDrop && "bg-accent/50")}>
      {children}
    </div>
  );
}
