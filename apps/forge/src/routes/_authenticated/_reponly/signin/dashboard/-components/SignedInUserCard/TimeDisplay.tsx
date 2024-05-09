import { iForgeEpoch } from "@/config/constants.ts";
import { Badge } from "@ui/components/ui/badge.tsx";
import { format, intervalToDuration } from "date-fns";
import * as React from "react";

interface TimeDisplayProps {
  timeIn: Date;
  inText?: string;
  durationText?: string;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeIn, inText, durationText }) => {
  const [duration, setDuration] = React.useState<string>("");
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (timeIn) {
        const now = new Date();
        const durationObj = intervalToDuration({ start: timeIn, end: now });
        const newDuration = `${durationObj.hours ?? 0}h ${durationObj.minutes ?? 0}m ${durationObj.seconds ?? 0}s`;
        setDuration(newDuration);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeIn]);

  // Timezone for the output
  const formattedTime = format(timeIn ?? iForgeEpoch, "HH:mm:ss");
  return (
    <div className="py-4 border-t border-gray-700 flex justify-between space-x-4">
      <div className="flex justify-between w-full gap-2">
        <div className="flex">
          <Badge variant="outline" className="rounded-sm shadow-md flex-col w-[90px]">
            <span className="text-accent-foreground">{inText ?? "Time In:"}</span>{" "}
            <span className="italic">{formattedTime}</span>
          </Badge>
        </div>
        <div className="flex">
          <Badge variant="outline" className="rounded-sm shadow-md flex-col w-[120px]">
            <span className="text-accent-foreground text-xs">{durationText ?? "Duration:"}</span>{" "}
            <span className="italic">{duration}</span>
          </Badge>
        </div>
      </div>
    </div>
  );
};
