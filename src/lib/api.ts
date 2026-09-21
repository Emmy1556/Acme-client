import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuth } from "@/stores/auth";
import type { User } from "./types";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ""}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ---------- silent refresh ---------- */
let refreshing: Promise<string | null> | null = null;

export function refreshSession(): Promise<string | null> {
  refreshing ??= axios
    .post<{ data: { user: User; accessToken: string } }>(
      `${import.meta.env.VITE_API_URL ?? ""}/api/auth/refresh`,
      {},
      { withCredentials: true },
    )
    .then(({ data }) => {
      useAuth.getState().setSession(data.data.user, data.data.accessToken);
      return data.data.accessToken;
    })
    .catch(() => {
      useAuth.getState().clear();
      return null;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    // Don't try to refresh when the failing call *is* a session call (would loop).
    const isAuthCall = /^\/auth\/(login|register|refresh|logout)$/.test(original?.url ?? "");
    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      const token = await refreshSession();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

/** Pulls a human-readable message out of an API error. */
export function errorMessage(err: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; details?: Record<string, string[]> } | undefined;
    const firstDetail = data?.details && Object.values(data.details)[0]?.[0];
    return firstDetail ? `${data?.message}: ${firstDetail}` : (data?.message ?? err.message ?? fallback);
  }
  return err instanceof Error ? err.message : fallback;
}

/** Strips undefined/empty values so they don't end up in the query string. */
export function cleanParams<T extends object>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null),
  ) as Partial<T>;
}
