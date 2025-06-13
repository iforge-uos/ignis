import { useTheme } from "@/hooks/useTheme";
import { Skeleton } from "@packages/ui/components/skeleton"; // Adjust the import path as necessary
import React, { useState } from "react";

// n.b does not work if leading char is lowercase because lol
export const IForgeLogo = ({ className }: { className?: string }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <Skeleton className={className} />}
      <img
        src={`${import.meta.env.VITE_CDN_URL}/logos/iforge${theme === "dark" ? "-dark" : ""}.png`} // TODO switch to svg
        alt="Logo"
        className={`${className} ${isLoading ? "hidden" : ""}`}
        onLoad={handleImageLoad}
      />
    </>
  );
};
