import axiosInstance from "@/api/axiosInstance";
import {
  authEffectAtom,
  loadingAtom,
  originalUserRolesAtom,
  userAtom,
  userRolesAtom,
} from "@/atoms/authSessionAtoms.ts";
import { User } from "@ignis/types/users.ts";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

export const useVerifyAuthentication = () => {
  const [, setAuthEffect] = useAtom(authEffectAtom);
  const [, setUser] = useAtom(userAtom);
  const [, setOriginalUserRoles] = useAtom(originalUserRolesAtom);
  const [, setUserRoles] = useAtom(userRolesAtom);
  const [loading, setLoading] = useAtom(loadingAtom);

  const isVerifyingRef = useRef(false); // Prevents multiple authentication requests simultaneously
  const isLoggedOutRef = useRef(false); // Keeps track of logged-out state to stop further requests

  const logout = useCallback(() => {
    isLoggedOutRef.current = true;
    setAuthEffect(false);
    setLoading(false);
  }, [setAuthEffect, setLoading]);

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
        const lowercaseRoles = (response.data as User).roles.map((role) => role.name.toLowerCase());
        setOriginalUserRoles(lowercaseRoles);
        setUserRoles(lowercaseRoles);
        setAuthEffect(true);
        isLoggedOutRef.current = false; // Mark that user is authenticated
      } else {
        // Clear user data and mark as aren't authenticated
        setAuthEffect(false);
      }
    } catch (_error) {
      setAuthEffect(false);
    } finally {
      setLoading(false);
      isVerifyingRef.current = false; // Mark that verification is complete
    }
  }, [setUser, setAuthEffect, setLoading, setOriginalUserRoles, setUserRoles]);

  // Run the authentication verification once when the hook is used
  useEffect(() => {
    if (!isLoggedOutRef.current) {
      verifyAuthentication();
    }
  }, [verifyAuthentication]);

  const [user] = useAtom(userAtom); // Get the user state

  return { user, loading };
};
