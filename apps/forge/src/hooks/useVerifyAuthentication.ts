import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { User } from "@ignis/types/users.ts";
import axiosInstance from "@/api/axiosInstance.ts";
import { userActions } from "@/redux/user.slice.ts";
import { authActions } from "@/redux/auth.slice.ts";

export const useVerifyAuthentication = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const dispatch = useDispatch();

  const verifyAuthentication = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/users/me");
      if (response.status === 200) {
        dispatch(userActions.setUser(response.data));
        dispatch(authActions.onLogin());
        setUser(response.data);
      } else {
        dispatch(authActions.onLogout());
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      dispatch(authActions.onLogout());
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    verifyAuthentication();
  }, [verifyAuthentication]);

  return { user, loading, setUser };
};
