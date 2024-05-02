import axios from "axios";
import {getCookie} from "@/services/cookies/cookieService.ts";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL as string,
    withCredentials: true,
});

// Add a request retry limit
const RETRY_LIMIT = 3;
const RETRY_DELAY = 1000; // Starting retry delay in milliseconds

axiosInstance.interceptors.request.use(config => {
    // Assuming your CSRF token is in a cookie accessible by JavaScript
    const csrfToken = getCookie("csrf_token")
    if (csrfToken && ['post', 'put', 'delete', 'patch'].includes(config.method!.toLowerCase())) {
        config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
}, error => {
    return Promise.reject(error);
});


axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            originalRequest._retryCount = originalRequest._retryCount || 0;

            if (originalRequest._retryCount >= RETRY_LIMIT) {
                return Promise.reject("Retry limit reached. Logging out...");
                //TODO WORK OUT HOW TO LOGOUT / WORK THIS BIT OUT IM NOT SURE EXACTLY WHAT IM DOING HERE RN
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
