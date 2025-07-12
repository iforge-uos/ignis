import { iForgeEpoch } from "@/lib/constants";
import { Temporal } from "@js-temporal/polyfill";
import { Badge } from "@packages/ui/components/badge";
import { format } from "date-fns";
import * as React from "react";

interface TimeDisplayProps {
  timeIn: Date;
  inText?: string;
  durationText?: string;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeIn, inText, durationText }) => {
  const [duration, setDuration] = React.useState("");

  React.useMemo(() => {
    const calculateDuration = () => {
      const durationObj = timeIn.toTemporalInstant().until(Temporal.Now.instant());
      setDuration(`${durationObj.hours}h ${durationObj.minutes}m ${durationObj.seconds}s`);
    };

    calculateDuration();
    const intervalId = setInterval(calculateDuration, 1000);

    return () => clearInterval(intervalId);
  }, [timeIn]);

  return (
    <div className="py-4 border-t border-gray-700 flex justify-between space-x-4">
      <div className="flex justify-between w-full gap-2">
        <div className="flex">
          <Badge variant="outline" className="rounded-sm shadow-md flex-col w-[90px]">
            <span className="text-accent-foreground">{inText ?? "Time In:"}</span>{" "}
            <span className="italic">{format(timeIn, "HH:mm:ss")}</span>
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
