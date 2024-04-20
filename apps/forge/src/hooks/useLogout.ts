import { AppDispatch, persistor } from "@/redux/store.ts";
import { userActions } from "@/redux/user.slice.ts";
import axiosInstance from "@/api/axiosInstance.ts";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/components/auth-provider";
import { useDispatch } from "react-redux";
import axios from "axios";

export const useLogout = () => {
  const dispatch: AppDispatch = useDispatch();
  const auth = useAuth();
  const navigate = useNavigate();

  return async () => {
    try {
      await axiosInstance.post("/authentication/logout");
      await persistor.purge();
      dispatch(userActions.clearUser());
      auth.logout();
      toast.success("Logged out successfully.");
      await navigate({ to: "/" });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        await navigate({ to: "/" });
        return;
      }
      console.error("Logout failed:", error);
      toast.error("Logout failed.");
      await navigate({ to: "/" });
    }
  };
};
