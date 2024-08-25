import { cn } from "@/lib/utils";
import { Location as LocationType } from "@ignis/types/training";
import { Heart, ParkingMeter, Wrench } from "lucide-react";
import React from "react";
import { IconWithTooltip } from ".";

interface IconProps {
  className?: string;
  tooltip?: boolean;
}

export const Mainspace: React.FC<IconProps> = ({ tooltip = true, className }) => {
  const icon = <Wrench className={cn("stroke-mainspace", className)} />;
  if (tooltip) {
    return <IconWithTooltip tooltipText="Mainspace">{icon}</IconWithTooltip>;
  }
  return icon;
};

export const Heartspace: React.FC<IconProps> = ({ tooltip = true, className }) => {
  const icon = <Heart className={cn("stroke-heartspace", className)} />;
  if (tooltip) {
    return <IconWithTooltip tooltipText="Heartspace">{icon}</IconWithTooltip>;
  }
  return icon;
};

export const GeorgePorter: React.FC<IconProps> = ({ tooltip = true, className }) => {
  const icon = <ParkingMeter className={cn("stroke-george-porter", className)} />;
  if (tooltip) {
    return <IconWithTooltip tooltipText="George Porter">{icon}</IconWithTooltip>;
  }
  return icon;
};

export const Location: React.FC<IconProps & { location: Uppercase<LocationType> | Lowercase<LocationType> }> = ({
  location,
  className,
  tooltip = true,
}) => {
  switch (location.toLowerCase() as Lowercase<LocationType>) {
    case "mainspace":
      return <MainspaceIcon className={className} tooltip={tooltip} />;
    case "heartspace":
      return <HeartspaceIcon className={className} tooltip={tooltip} />;
    case "george_porter":
      return <GeorgePorterIcon className={className} tooltip={tooltip} />;
    default:
      throw new Error("unreachable");
  }
};

export const MainspaceIcon = Mainspace;
export const HeartspaceIcon = Heartspace;
export const GeorgePorterIcon = GeorgePorter;
export const LocationIcon = Location;
