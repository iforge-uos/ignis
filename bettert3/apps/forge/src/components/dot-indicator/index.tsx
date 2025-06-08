import { cn } from "@/lib/utils";
import React from "react";

interface DotIndicatorProps {
  count: number;
  current: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const DotIndicator: React.FC<DotIndicatorProps> = ({ count, current, orientation = "horizontal", className }) => {
  return (
    <div
      className={cn(
        `absolute flex transform ${orientation === "horizontal" ? "bottom-0 left-1/2 -translate-x-1/2  space-x-2" : "right-0 top-1/2 -translate-y-1/2 flex-col space-y-2"}`,
        className,
      )}
    >
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`w-4 h-4 rounded-lg transition-colors duration-300 border-2 ${current === index + 1 ? "border-accent-foreground" : "border-accent"}`}
        />
      ))}
    </div>
  );
};

export default DotIndicator;
