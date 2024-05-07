import axios from "axios";
import { getCookie } from "@/services/cookies/cookieService.ts";
import { v4 as uuidV4 } from "uuid";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
});

// Add a request retry limit
const RETRY_LIMIT = 3;
const RETRY_DELAY = 1000; // Starting retry delay in milliseconds
const IDEMPOTENCY_KEY_INTERVAL = 100; // Generate a new idempotency key every 100ms

let lastIdempotencyKey = "";
let lastIdempotencyKeyTimestamp = 0;

const generateIdempotencyKey = () => {
  const currentTimestamp = Date.now();
  if (currentTimestamp - lastIdempotencyKeyTimestamp >= IDEMPOTENCY_KEY_INTERVAL) {
    lastIdempotencyKey = uuidV4();
    lastIdempotencyKeyTimestamp = currentTimestamp;
  }
  return lastIdempotencyKey;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const csrfToken = getCookie("csrf_token");
    if (csrfToken && ["post", "put", "delete", "patch"].includes(config.method!.toLowerCase())) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    // Generate and add the idempotency key for POST requests
    if (config.method === "post") {
      config.headers["X-Idempotency-Key"] = generateIdempotencyKey();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount >= RETRY_LIMIT) {
        return Promise.reject("Retry limit reached. Logging out...");
      }

      originalRequest._retryCount++;

      try {
        // Introduce a delay before retrying
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * 2 ** (originalRequest._retryCount - 1)));
        await axiosInstance.post("/authentication/refresh");
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    } else {
      return Promise.reject(error);
    }
  },
);

export default axiosInstance;
