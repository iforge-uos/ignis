import axiosInstance from "@/api/axiosInstance";
import {
  authEffectAtom,
  loadingAtom,
  originalUserRolesAtom,
  userAtom,
  userRolesAtom,
} from "@/atoms/authSessionAtoms.ts";
import { User } from "@ignis/types/users.ts";
import { AxiosError } from "axios";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

export const useVerifyAuthentication = () => {
  const [, setAuthEffect] = useAtom(authEffectAtom);
  const [user, setUser] = useAtom(userAtom);
  const [, setOriginalUserRoles] = useAtom(originalUserRolesAtom);
  const [, setUserRoles] = useAtom(userRolesAtom);
  const [loading, setLoading] = useAtom(loadingAtom);

  const isVerifyingRef = useRef(false);
  const isLoggedOutRef = useRef(false);
  const mountedRef = useRef(true);

  const logout = useCallback(() => {
    if (!mountedRef.current) return;

    isLoggedOutRef.current = true;
    isVerifyingRef.current = false; // Reset verifying state
    setAuthEffect(false);
    setLoading(false); // Ensure loading is set to false
  }, [setAuthEffect, setLoading]);

  useEffect(() => {
    axiosInstance.setLogoutCallback(logout);
    mountedRef.current = true; // Set mounted to true when component mounts

    return () => {
      mountedRef.current = false;
    };
  }, [logout]);

  const verifyAuthentication = useCallback(async () => {
    if (isVerifyingRef.current || isLoggedOutRef.current || !mountedRef.current) {
      setLoading(false);
      return;
    }

    isVerifyingRef.current = true;
    setLoading(true);

    try {
      const response = await axiosInstance.get<User>("/users/me");

      if (!mountedRef.current) {
        setLoading(false);
        return;
      }

      if (response.status === 200 && response.data) {
        const userData = response.data;
        const lowercaseRoles = userData.roles.map((role) => role.name.toLowerCase());

        // Return a promise that resolves when all state updates are complete
        return new Promise<void>((resolve) => {
          // Update states sequentially
          setUser(userData);
          setOriginalUserRoles(lowercaseRoles);
          setUserRoles(lowercaseRoles);
          setAuthEffect(true);
          isLoggedOutRef.current = false;

          // Resolve after a small delay to ensure state updates are processed
          setTimeout(() => {
            if (mountedRef.current) {
              setLoading(false);
              resolve();
            }
          }, 100);
        });
      }
    } catch (error) {
      console.error("Auth verification error:", error);
      if (!mountedRef.current) {
        setLoading(false);
        return;
      }

      setUser(null);
      setOriginalUserRoles([]);
      setUserRoles([]);

      if (error instanceof AxiosError) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          logout();
        } else {
          setAuthEffect(false);
          setLoading(false);
        }
      } else {
        setAuthEffect(false);
        setLoading(false);
      }
    } finally {
      if (mountedRef.current) {
        isVerifyingRef.current = false;
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }
    }
  }, [setUser, setAuthEffect, setLoading, setOriginalUserRoles, setUserRoles, logout]);

  useEffect(() => {
    // Initial verification
    if (!isLoggedOutRef.current && mountedRef.current) {
      verifyAuthentication();
    }

    return () => {
      mountedRef.current = false;
      setLoading(false); // Ensure loading is false when unmounting
    };
  }, [verifyAuthentication, setLoading]);

  return {
    user,
    loading: loading && !isLoggedOutRef.current, // Only show loading if not logged out
    verifyAuthentication
  };
};
