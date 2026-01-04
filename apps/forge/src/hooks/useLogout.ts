import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { handleSignout } from "@/lib/utils/auth";

export const useLogout = () => {
  const navigate = useNavigate();

  return async () => {
    try {
      await handleSignout()

      toast.success("Logged out successfully.");

      await navigate({ to: "/", reloadDocument: true });  // hard reload to force invalidate all context
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed.");
      await navigate({ to: "/" });
    }
  };
};

