import { cn } from "@packages/ui/lib/utils";
import React from "react";

interface DotIndicatorProps {
  count: number;
  current: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const DotIndicator: React.FC<DotIndicatorProps> = ({ count, current = 1, orientation = "horizontal", className }) => {
  return (
    <div
      className={cn(
        orientation === "horizontal"
          ? "absolute bottom-0 left-1/2 -translate-x-1/2 flex space-x-2"
          : "absolute right-2 top-0 bottom-0 flex flex-col items-center justify-center space-y-2",
        className,
      )}
    >
      {[...Array(count)].map((_, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={index}
          className={cn(`size-4 rounded-lg duration-500 border-2 transition-all`, current === index + 1 ? `border-ring` : "border-border")}
          style={{
            width: current === index + 1 && orientation === "horizontal" ? "32px" : "16px",
            height: current === index + 1 && orientation === "vertical" ? "32px" : "16px",
          }}
        />
      ))}
    </div>
  );
};

export default DotIndicator;
