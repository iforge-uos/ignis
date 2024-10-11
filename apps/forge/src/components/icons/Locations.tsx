import { Location as LocationType } from "@ignis/types/training";
import { Heart, ParkingMeter, Wrench } from "lucide-react";
import React from "react";
import { IconWithTooltip } from ".";

interface IconProps {
  className?: string;
}

export const Mainspace: React.FC<IconProps> = (props) => (
  <IconWithTooltip {...props} IconComponent={Wrench} tooltipText="Mainspace" strokeClass="stroke-mainspace" />
);

export const Heartspace: React.FC<IconProps> = (props) => (
  <IconWithTooltip {...props} IconComponent={Heart} tooltipText="Heartspace" strokeClass="stroke-heartspace" />
);

export const GeorgePorter: React.FC<IconProps> = (props) => (
  <IconWithTooltip
    {...props}
    IconComponent={ParkingMeter}
    tooltipText="George Porter"
    strokeClass="stroke-george-porter"
  />
);

export const Location: React.FC<IconProps & { location: Uppercase<LocationType> | Lowercase<LocationType> }> = ({
  location,
  className,
}) => {
  switch (location.toLowerCase() as Lowercase<LocationType>) {
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

export const MainspaceIcon = Mainspace;
export const HeartspaceIcon = Heartspace;
export const GeorgePorterIcon = GeorgePorter;
export const LocationIcon = Location;
