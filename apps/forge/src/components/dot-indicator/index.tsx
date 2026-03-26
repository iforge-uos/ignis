import React from "react";
import { cn } from "@/lib/utils/cn";

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
        "flex absolute bottom-0",
        orientation === "horizontal"
          ? "left-1/2 -translate-x-1/2 space-x-2"
          : "right-2 top-0 flex-col items-center justify-center space-y-2",
        className,
      )}
    >
      {[...Array(count)].map((_, index) => {
        const active = current === index + 1;
        return (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: FP
          key={index}
          className={cn(`size-4 rounded-lg duration-500 border-2 transition-all`, active ? `border-ring` : "border-border")}
          style={{
            width: active && orientation === "horizontal" ? "32px" : "16px",
            height: active && orientation === "vertical" ? "32px" : "16px",
          }}
        />
      )})}
    </div>
  );
};

export default DotIndicator;
