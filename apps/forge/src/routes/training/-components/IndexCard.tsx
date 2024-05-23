import React from "react";
import { Link } from "@tanstack/react-router";

interface IndexCardProps {
  to?: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  onClick?: () => void;
}

const IndexCard: React.FC<IndexCardProps> = ({ to, imageSrc, imageAlt, title, description, onClick }) => {
  const CardContent = () => (
    <div className="group relative w-full max-w-sm cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <img
        alt={imageAlt}
        className="h-60 w-full object-cover"
        height="240"
        src={imageSrc}
        style={{
          aspectRatio: "360/240",
          objectFit: "cover",
        }}
        width="360"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-gray-300 text-balance">{description}</p>
      </div>
    </div>
  );

  return to ? (
    <Link to={to}>
      <CardContent />
    </Link>
  ) : (
    <div onClick={onClick} onKeyDown={onClick}>
      <CardContent />
    </div>
  );
};

export default IndexCard;
