import React from "react";

interface ImageGradientProps {
  imageSrc: string;
  imageAlt: string;
  gradientColor: string;
  maxHeight?: string;
  aspectRatio?: string;
}

const ImageGradient: React.FC<ImageGradientProps> = ({
  imageSrc,
  imageAlt,
  gradientColor,
  maxHeight = "400px",
  aspectRatio = "360/240",
}) => {
  return (
    <div className="relative w-full overflow-hidden rounded-lg" style={{ maxHeight }}>
      <img
        alt={imageAlt}
        className="w-full h-full object-contain"
        src={imageSrc}
        style={{
          aspectRatio,
          objectFit: "cover", // Ensure the entire image is visible within the container
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, var(--${gradientColor}) 5%, transparent 50%)`,
        }}
      />
    </div>
  );
};

export default ImageGradient;
