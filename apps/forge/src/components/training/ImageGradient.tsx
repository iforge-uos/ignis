import { cn } from "@/lib/utils";
import React from "react";
import { useMediaQuery } from "react-responsive";
import ImageWithPlaceholder from "../loading/img";

interface ImageGradientProps {
  imageSrc: string;
  imageAlt: string;
  gradientColor: string;
  maxHeight?: string;
  aspectRatio?: string;
  gradientAmount?: number; // must be in [0, 1]
  className?: string;
}

const ImageGradient: React.FC<ImageGradientProps> = ({
  imageSrc,
  imageAlt,
  gradientColor,
  maxHeight = "400px",
  aspectRatio = "360/240",
  gradientAmount = 0.5,
  className,
}) => {
  const isMediumScreen = useMediaQuery({ minWidth: 768 });
  const gradientPercentage = `${gradientAmount * 100 * (isMediumScreen ? 1 : 1.25)}%`;

  return (
    <div className="relative w-full overflow-hidden rounded-lg h-fit" style={{ maxHeight }}>
      <ImageWithPlaceholder
        alt={imageAlt}
        className={cn("w-full h-full object-cover", className)}
        src={imageSrc}
        aspectRatio={aspectRatio}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, var(--${gradientColor}) 5%, transparent ${gradientPercentage})`,
        }}
      />
    </div>
  );
};

export default ImageGradient;
