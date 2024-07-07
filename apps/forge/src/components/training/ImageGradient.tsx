import React from "react";
import { useMediaQuery } from "react-responsive";

interface ImageGradientProps {
  gradientColor: string;
  gradientAmount?: number; // must be in [0, 1]
  children: React.ReactNode;
}

const ImageGradient: React.FC<ImageGradientProps> = ({ gradientColor, gradientAmount = 0.5, children }) => {
  const isMediumScreen = useMediaQuery({ minWidth: 768 });
  const gradientPercentage = `${gradientAmount * 100 * (isMediumScreen ? 1 : 1.25)}%`;

  return (
    <div className="overflow-hidden rounded-lg">
      {children}
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
