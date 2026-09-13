import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Не перехватываем 401 от самих auth-эндпоинтов — иначе рекурсия
    const isAuthEndpoint =
      original.url?.includes("/auth/refresh") ||
      original.url?.includes("/auth/login");

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {

      try {
        if (!refreshPromise) {
          refreshPromise = api
            .post<{ access_token: string }>("/auth/refresh")
            .then((r) => r.data.access_token)
            .finally(() => {
              refreshPromise = null;
            });
        }
        const newToken = await refreshPromise;
        setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
