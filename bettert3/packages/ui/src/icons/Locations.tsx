import type { training } from "../../../db/interfaces.js";
import { cn } from "@packages/ui/lib/utils";
import { Heart, ParkingMeter, Wrench } from "lucide-react";
import React from "react";
import { IconWithTooltip } from "./index.js";

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

export const Location: React.FC<IconProps & { location: Uppercase<training.LocationName> | Lowercase<training.LocationName> }> = ({
  location,
  className,
  tooltip = true,
}) => {
  location = location.toLowerCase() as Lowercase<training.LocationName>
  switch (location) {
    case "mainspace":
      return <MainspaceIcon className={className} tooltip={tooltip} />;
    case "heartspace":
      return <HeartspaceIcon className={className} tooltip={tooltip} />;
    case "george_porter":
      return <GeorgePorterIcon className={className} tooltip={tooltip} />;
    default:
      unreachable(location);
  }
};

export const MainspaceIcon = Mainspace;
export const HeartspaceIcon = Heartspace;
export const GeorgePorterIcon = GeorgePorter;
export const LocationIcon = Location;

function unreachable(value?: never): never {
  throw new Error(`Reached unreachable code with value: ${JSON.stringify(value)}`);
}

