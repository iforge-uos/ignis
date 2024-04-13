import axios from "axios";
import { useDispatch } from "react-redux";
import useLogout from "@/services/auth/useLogout.ts";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add a request retry limit
const RETRY_LIMIT = 3;
const RETRY_DELAY = 1000; // Starting retry delay in milliseconds

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const dispatch = useDispatch();
    const logout = useLogout(dispatch);
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount >= RETRY_LIMIT) {
        await logout;
        return Promise.reject("Retry limit reached. Logging out...");
      }

      originalRequest._retryCount++;

      try {
        // Introduce a delay before retrying
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * 2 ** (originalRequest._retryCount - 1)));
        await axiosInstance.post("/authentication/refresh");
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await logout;
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
