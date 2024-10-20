import { Apps } from "@/types/app.ts";
import { useLocation } from "@tanstack/react-router";
import { useMemo } from "react";

const useCurrentApp = (): Apps => {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  return useMemo(() => {
    // Split the pathname and get the first segment
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0]?.toLowerCase();

    switch (firstSegment) {
      case "":
      case undefined:
        return "Main";
      case "sign-in":
        return "Sign In";
      case "printing":
        return "Printing";
      case "user":
        return "User";
      case "admin":
        return "Admin";
      case "training":
        return "Training";
      case "auth":
        return "Auth";
      case "socials":
        return "Socials";
      default:
        return "Error";
    }
  }, [pathname]); // Only recalculate when pathname changes
};

export default useCurrentApp;
