import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
    AxiosRequestConfig,
    AxiosInstance
} from "axios";

interface QueuedRequest {
    config: InternalAxiosRequestConfig;
    resolve: (value: AxiosResponse) => void;
    reject: (error: any) => void;
}

class AxiosAuthInstance {
    private readonly axiosInstance: AxiosInstance;
    private isRefreshing = false;
    private requestQueue: QueuedRequest[] = [];
    private logoutCallback: (() => void) | null = null;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: import.meta.env.VITE_API_URL as string,
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Add request interceptor for CSRF
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const csrfToken = this.getCookie("csrf_token");
                if (csrfToken && config.headers) {
                    config.headers["x-csrf-token"] = csrfToken;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor for handling 401s
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error instanceof AxiosError && error.response?.status === 401) {
                    return this.handle401Error(error.config as InternalAxiosRequestConfig);
                }
                return Promise.reject(error);
            }
        );
    }

    setLogoutCallback(callback: () => void) {
        this.logoutCallback = callback;
    }

    private getCookie(name: string): string | null {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(";").shift() || null;
        }
        return null;
    }

    private async refreshTokens(): Promise<boolean> {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/authentication/refresh`,
                {},
                { withCredentials: true }
            );
            return response.status === 200 || response.status === 201;
        } catch (error) {
            console.error("Token refresh failed:", error);
            return false;
        }
    }

    private async processQueue() {
        const queue = [...this.requestQueue];
        this.requestQueue = [];

        for (const request of queue) {
            try {
                const response = await this.axiosInstance.request(request.config);
                request.resolve(response);
            } catch (error) {
                request.reject(error);
            }
        }
    }

    private async handle401Error(failedConfig: InternalAxiosRequestConfig): Promise<AxiosResponse> {
        if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
                this.requestQueue.push({
                    config: failedConfig,
                    resolve,
                    reject,
                });
            });
        }

        this.isRefreshing = true;

        try {
            const refreshSuccess = await this.refreshTokens();

            if (!refreshSuccess) {
                throw new Error("Token refresh failed");
            }

            await this.processQueue();
            return await this.axiosInstance.request(failedConfig);
        } catch (error) {
            for (const request of this.requestQueue) {
                request.reject(error);
            }
            this.requestQueue = [];

            if (this.logoutCallback) {
                setTimeout(() => {
                    if (this.logoutCallback) this.logoutCallback();
                }, 100);
            }
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }

    // Proxy all axios methods
    get instance(): AxiosInstance {
        return this.axiosInstance;
    }

    get<T = any>(url: string, config?: AxiosRequestConfig) {
        return this.axiosInstance.get<T>(url, config);
    }

    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.axiosInstance.post<T>(url, data, config);
    }

    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.axiosInstance.put<T>(url, data, config);
    }

    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.axiosInstance.patch<T>(url, data, config);
    }

    delete<T = any>(url: string, config?: AxiosRequestConfig) {
        return this.axiosInstance.delete<T>(url, config);
    }
}

// Create and export a single instance
const axiosAuthInstance = new AxiosAuthInstance();
export default axiosAuthInstance;