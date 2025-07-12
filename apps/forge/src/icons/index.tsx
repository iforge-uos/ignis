import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import React from "react";

interface IconWithTooltip {
  children: React.ReactElement;
  tooltipText: string;
}

export const IconWithTooltip: React.FC<IconWithTooltip> = ({ tooltipText, children }) => {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};
