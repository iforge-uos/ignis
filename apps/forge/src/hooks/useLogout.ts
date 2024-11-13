import { useAtom } from "jotai";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { authEffectAtom } from "@/atoms/authSessionAtoms.ts";
import axios from "axios";

export const useLogout = () => {
  const [, setAuthEffect] = useAtom(authEffectAtom); // Use Jotai to handle logout effects
  const navigate = useNavigate();

  return async () => {
    try {
      // Call the logout endpoint
      await axiosInstance.post("/authentication/logout");

      // Clear the Jotai state for user and authentication
      setAuthEffect(false); // This will set `isAuthenticatedAtom` to false and clear `userAtom`

      // Show success message
      toast.success("Logged out successfully.");

      // Navigate to the home page
      await navigate({ to: "/" });
    } catch (error) {
      // Handle specific error cases
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        await navigate({ to: "/" });
        return;
      }

      // Log the error and show an error message
      console.error("Logout failed:", error);
      toast.error("Logout failed.");
      await navigate({ to: "/" });
    }
  };
};
