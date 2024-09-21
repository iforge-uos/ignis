import { useTheme } from "@/providers/themeProvider/use-theme";
import { Skeleton } from "@ui/components/ui/skeleton"; // Adjust the import path as necessary
import { useState } from "react";

// n.b does not work if leading char is lowercase because lol
export const IForgeLogo = ({ className }: { className?: string }) => {
  const { normalisedTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <Skeleton className={className} />}
      <img
        src={`${import.meta.env.VITE_CDN_URL}/logos/iforge${normalisedTheme === "dark" ? "-dark" : ""}.png`} // TODO switch to svg
        alt="Logo"
        className={`${className} ${isLoading ? "hidden" : ""}`}
        onLoad={handleImageLoad}
      />
    </>
  );
};
