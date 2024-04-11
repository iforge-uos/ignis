import axios from "axios";
import { store } from "@/redux/store.ts";
import { authActions } from "@/redux/auth/auth.slice.ts";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axiosInstance.post("/authentication/refresh");
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(authActions.onLogout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
