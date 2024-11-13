// src/hooks/useVerifyAuthentication.ts
import { useCallback, useEffect } from "react";
import { useAtom } from "jotai";
import axiosInstance from "@/api/axiosInstance";
import { authEffectAtom, userAtom, loadingAtom } from "@/atoms/authSessionAtoms.ts";

export const useVerifyAuthentication = () => {
  const [, setAuthEffect] = useAtom(authEffectAtom); // Sets authentication status
  const [, setUser] = useAtom(userAtom); // Sets the user data in Jotai
  const [loading, setLoading] = useAtom(loadingAtom); // Manages the loading state

  const verifyAuthentication = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/users/me");
      if (response.status === 200) {
        // Set user data and mark as authenticated
        setUser(response.data);
        setAuthEffect(true);
      } else {
        // Clear user data and mark as not authenticated
        setAuthEffect(false);
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      setAuthEffect(false);
    } finally {
      setLoading(false);
    }
  }, [setUser, setAuthEffect, setLoading]);

  useEffect(() => {
    verifyAuthentication();
  }, [verifyAuthentication]);

  const [user] = useAtom(userAtom); // Get the user state

  return { user, loading };
};
