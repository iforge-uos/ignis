import { cn } from "@/lib/utils";
import { Location } from "@ignis/types/training";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import { Heart, ParkingMeter, Wrench } from "lucide-react";
import React from "react";

interface IconProps {
  className?: string;
}

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

export const MainspaceIcon: React.FC<IconProps> = (props) => (
  <IconWithTooltip {...props} IconComponent={Wrench} tooltipText="Mainspace" strokeClass="stroke-mainspace" />
);

export const HeartspaceIcon: React.FC<IconProps> = (props) => (
  <IconWithTooltip {...props} IconComponent={Heart} tooltipText="Heartspace" strokeClass="stroke-heartspace" />
);

export const GeorgePorterIcon: React.FC<IconProps> = (props) => (
  <IconWithTooltip
    {...props}
    IconComponent={ParkingMeter}
    tooltipText="George Porter"
    strokeClass="stroke-george-porter"
  />
);

export const LocationIcon: React.FC<IconProps & { location: Uppercase<Location> | Lowercase<Location> }> = ({
  location,
  className,
}) => {
  switch (location.toLowerCase() as Lowercase<Location>) {
    case "mainspace":
      return <MainspaceIcon className={className} />;
    case "heartspace":
      return <HeartspaceIcon className={className} />;
    case "george_porter":
      return <GeorgePorterIcon className={className} />;
    default:
      throw new Error("unreachable");
  }
};
