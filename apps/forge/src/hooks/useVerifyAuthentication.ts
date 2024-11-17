import axiosInstance from "@/api/axiosInstance";
import { authEffectAtom, loadingAtom, userAtom } from "@/atoms/authSessionAtoms.ts";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

export const useVerifyAuthentication = () => {
  const [, setAuthEffect] = useAtom(authEffectAtom);
  const [, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useAtom(loadingAtom);

  const isVerifyingRef = useRef(false); // Prevents multiple authentication requests simultaneously
  const isLoggedOutRef = useRef(false); // Keeps track of logged-out state to stop further requests

  const logout = useCallback(() => {
    isLoggedOutRef.current = true;
    setAuthEffect(false);
    setLoading(false);
    setUser(null);
  }, [setAuthEffect, setLoading, setUser]);

  // Set the logout callback once when the hook mounts
  useEffect(() => {
    axiosInstance.setLogoutCallback(logout);
  }, [logout]);

  const verifyAuthentication = useCallback(async () => {
    if (isLoggedOutRef.current) {
      return; // Stop verification if the user has been logged out
    }

    if (isVerifyingRef.current) {
      return; // Prevent multiple calls if a request is already in progress
    }

    isVerifyingRef.current = true; // Mark that verification is in progress
    setLoading(true);

    try {
      const response = await axiosInstance.get("/users/me");
      if (response.status === 200) {
        // Set user data and mark as authenticated
        setUser(response.data);
        setAuthEffect(true);
        isLoggedOutRef.current = false; // Mark that user is authenticated
      } else {
        // Clear user data and mark as aren't authenticated
        setAuthEffect(false);
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      setAuthEffect(false);
    } finally {
      setLoading(false);
      isVerifyingRef.current = false; // Mark that verification is complete
    }
  }, [setUser, setAuthEffect, setLoading]);

  // Run the authentication verification once when the hook is used
  useEffect(() => {
    if (!isLoggedOutRef.current) {
      verifyAuthentication();
    }
  }, [verifyAuthentication]);

  const [user] = useAtom(userAtom); // Get the user state

  return { user, loading };
};
