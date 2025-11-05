import type { IEvent } from "@packages/ui/calendar/interfaces";
import { cn } from "@packages/ui/lib/utils";
import React, { useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

export const ItemTypes = {
  EVENT: "event",
};

interface DraggableEventProps {
  event: IEvent;
  children: React.ReactNode;
  editable?: boolean;
}

export function DraggableEvent({ event, children, editable = true }: DraggableEventProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.EVENT,
    canDrag: editable,
    item: () => {
      const width = ref.current?.offsetWidth || 0;
      const height = ref.current?.offsetHeight || 0;
      return { event, children, width, height };
    },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  }));

  // Hide the default drag preview
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  drag(ref);

  return (
    <div ref={ref} className={cn(isDragging && "opacity-40")}>
      {children}
    </div>
  );
}
