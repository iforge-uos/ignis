import { cn } from "@/lib/utils";
import { Skeleton } from "@packages/ui/components/skeleton";
import React, { useState } from "react";

interface ImageWithPlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  src,
  alt,
  className,
  aspectRatio = "360/240",
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const aspectRatioStyle =
    aspectRatio
      .split("/")
      .map(Number)
      .reduce((p, c) => c / p) * 100;

  return (
    <div className="relative" style={{ paddingBottom: `${aspectRatioStyle}%` }}>
      <img
        src={src}
        alt={alt}
        onLoad={() => setImageLoaded(true)}
        className={cn("absolute w-full h-full object-cover", className, { hidden: !imageLoaded })}
      />
      {!imageLoaded && <Skeleton className="absolute top-0 left-0 w-full h-full" />}
    </div>
  );
};

export default ImageWithPlaceholder;
