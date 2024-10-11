import { cn } from "@/lib/utils";
import React from "react";

interface IndexCardProps {
  img: React.ReactElement;
  title: React.ReactElement;
  description: string;
  className?: string;
}

const IndexCard: React.FC<IndexCardProps> = ({ img, title, description, className }) => {
  return (
    <div
      className={cn(
        "group relative w-full max-w-lg cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg",
        className,
      )}
    >
      {img}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-12">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-gray-200">{description}</p>
      </div>
    </div>
  );
};

export default IndexCard;
