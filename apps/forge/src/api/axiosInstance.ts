import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosInstance } from "axios";

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
  // Timestamp of last refresh
  private lastRefreshAttempt = 0;
  // Minimum time between refresh attempts
  private readonly REFRESH_COOLDOWN = 5000;

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
      (error) => Promise.reject(error),
    );

    // Setup response interceptor - ONLY ONCE
    this.setupInterceptors();
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
    const now = Date.now();
    if (now - this.lastRefreshAttempt < this.REFRESH_COOLDOWN) {
      return false;
    }
    this.lastRefreshAttempt = now;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/authentication/refresh`,
        {},
        { withCredentials: true },
      );
      return response.status === 200 || response.status === 201;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle any error status as a failure that should trigger logout
        if (this.logoutCallback) {
          this.logoutCallback();
        }
        throw new Error("INVALID_REFRESH_TOKEN");
      }
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
    // Don't retry refresh requests themselves
    if (failedConfig.url?.includes("/authentication/refresh")) {
      throw new Error("Refresh request failed");
    }

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
        // Clear queue and logout
        for (const request of this.requestQueue) {
          request.reject(new Error("Authentication failed"));
        }
        this.requestQueue = [];

        if (this.logoutCallback) {
          this.logoutCallback();
        }
        throw new Error("Authentication failed");
      }

      // If refresh was successful, process the queue
      const response = await this.axiosInstance.request(failedConfig);
      await this.processQueue();
      return response;
    } catch (error) {
      for (const request of this.requestQueue) {
        request.reject(error);
      }
      this.requestQueue = [];

      // If it's our specific invalid refresh token error, we've already handled logout
      if (error instanceof Error && error.message !== "INVALID_REFRESH_TOKEN") {
        if (this.logoutCallback) {
          this.logoutCallback();
        }
      }
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Add a method to modify axios interceptors
  private setupInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Don't intercept refresh token errors
        if (error.config?.url?.includes("/authentication/refresh")) {
          return Promise.reject(error);
        }

        // Don't intercept /users/me 401s
        if (
          error.config?.url?.includes("/users/me") &&
          error.response?.status === 401 &&
          error.response?.data?.message === "Unauthorized"
        ) {
          return Promise.reject(error);
        }

        // Handle other 401s with refresh attempt
        if (error instanceof AxiosError && error.response?.status === 401) {
          try {
            return await this.handle401Error(error.config as InternalAxiosRequestConfig);
          } catch (refreshError) {
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      },
    );
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
