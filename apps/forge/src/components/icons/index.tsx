import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import React from "react";

interface IconWithTooltip {
  className?: string;
  IconComponent: React.ComponentType<any>;
  tooltipText: string;
  strokeClass: string;
}

export const IconWithTooltip: React.FC<IconWithTooltip> = ({ className, IconComponent, tooltipText, strokeClass }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <IconComponent className={cn(strokeClass, "m-2", className)} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
