import { getCookie } from "@/services/cookies/cookieService.ts";
import { notFound } from "@tanstack/react-router";
import axios from "axios";
import { v4 as uuidV4 } from "uuid";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL as string,
    withCredentials: true,
});

const RETRY_LIMIT = 3;
const RETRY_DELAY = 1000;
const IDEMPOTENCY_KEY_INTERVAL = 100;

let lastIdempotencyKey = "";
let lastIdempotencyKeyTimestamp = 0;

// Token refresh state management
let isRefreshing = false;
let refreshQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
    config: any;
}> = [];

const generateIdempotencyKey = () => {
    const currentTimestamp = Date.now();
    if (currentTimestamp - lastIdempotencyKeyTimestamp >= IDEMPOTENCY_KEY_INTERVAL) {
        lastIdempotencyKey = uuidV4();
        lastIdempotencyKeyTimestamp = currentTimestamp;
    }
    return lastIdempotencyKey;
};

const processQueue = (error: any = null) => {
    for (const request of refreshQueue) {
        if (error) {
            request.reject(error);
        } else {
            request.resolve(axiosInstance(request.config));
        }
    }
    refreshQueue = [];
};

const addToQueue = (config: any) => {
    return new Promise((resolve, reject) => {
        refreshQueue.push({
            resolve,
            reject,
            config,
        });
    });
};

axiosInstance.interceptors.request.use(
    (config) => {
        const csrfToken = getCookie("csrf_token");
        if (csrfToken && ["post", "put", "delete", "patch"].includes(config.method!.toLowerCase())) {
            config.headers["X-CSRF-Token"] = csrfToken;
        }

        if (config.method === "post") {
            // Don't generate new idempotency keys for retry attempts
            if (!(config as any)._retry) {
                config.headers["X-Idempotency-Key"] = generateIdempotencyKey();
            }
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

        // Handle 404 and 403 cases first
        if (error.response?.status === 404) {
            throw notFound();
        }if (error.response?.status === 403) {
            throw notFound();
        }

        // Handle authentication errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

            if (originalRequest._retryCount > RETRY_LIMIT) {
                processQueue(new Error("Retry limit exceeded"));
                return Promise.reject("Retry limit reached. Logging out...");
            }

            // If we're already refreshing, add this request to the queue
            if (isRefreshing) {
                try {
                    return await addToQueue(originalRequest);
                } catch (queueError) {
                    return Promise.reject(queueError);
                }
            }

            isRefreshing = true;

            try {
                // Add exponential backoff delay
                await new Promise((resolve) =>
                    setTimeout(resolve, RETRY_DELAY * 2 ** (originalRequest._retryCount! - 1))
                );

                await axiosInstance.post("/authentication/refresh");

                isRefreshing = false;
                processQueue();

                // Retry the original request
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

export default axiosInstance;
