import { Apps } from "@/types/app";
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
      case "sign-in":
        return "Sign In";
      case "printing":
        return "Printing";
      case "user":
      case "users":
        return "User";
      case "admin":
        return "Admin";
      case "training":
        return "Training";
      default:
        return "Home";
    }
  }, [pathname]); // Only recalculate when pathname changes
};

export default useCurrentApp;
