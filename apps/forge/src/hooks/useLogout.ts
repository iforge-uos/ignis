import axiosInstance from "@/api/axiosInstance";
import {authEffectAtom, loadingAtom} from "@/atoms/authSessionAtoms";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { useAtom } from "jotai";
import { toast } from "sonner";

export const useLogout = () => {
  const [, setAuthEffect] = useAtom(authEffectAtom);
  const [, setLoading] = useAtom(loadingAtom);
  const navigate = useNavigate();

  return async () => {
    try {
      await axiosInstance.post("/authentication/logout");

      setAuthEffect(false);
      setLoading(false);

      toast.success("Logged out successfully.");

      await navigate({ to: "/" });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setAuthEffect(false);
        setLoading(false);
        await navigate({ to: "/" });
        return;
      }

      console.error("Logout failed:", error);
      toast.error("Logout failed.");
      setAuthEffect(false);
      setLoading(false);
      await navigate({ to: "/" });
    }
  };
};

