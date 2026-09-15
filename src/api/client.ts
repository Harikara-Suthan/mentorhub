import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeGetJSON,
  safeSetJSON,
} from "../utils/storage";

export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

const CACHE_PREFIX = "mh_offline_cache:";
const MAX_CACHE_ENTRIES = 100;

interface CacheEntry {
  data: any;
  timestamp: number;
  url: string;
}

function getCacheKey(config: InternalAxiosRequestConfig): string {
  try {
    const paramsKey = config.params ? JSON.stringify(config.params) : "";
    return `${CACHE_PREFIX}${config.method?.toUpperCase()}:${config.url}:${paramsKey}`;
  } catch {
    return `${CACHE_PREFIX}${config.method?.toUpperCase()}:${config.url || ""}`;
  }
}

export function getCachedResponse(url: string, params?: any): any | null {
  try {
    const paramsKey = params ? JSON.stringify(params) : "";
    const key = `${CACHE_PREFIX}GET:${url}:${paramsKey}`;
    const entry = safeGetJSON<CacheEntry>(key, null);
    return entry?.data ?? null;
  } catch {
    return null;
  }
}

function saveToCache(config: InternalAxiosRequestConfig, data: any) {
  try {
    if (!config.url) return;
    const key = getCacheKey(config);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      url: config.url,
    };
    safeSetJSON(key, entry);
  } catch {
    // If storage is constrained, safe storage handles it
  }
}

function invalidateRelatedCache(url?: string) {
  if (!url || typeof window === "undefined" || !window.localStorage) return;
  try {
    const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
    keys.forEach((k) => {
      if (
        (url.includes("meeting") && k.includes("meeting")) ||
        (url.includes("student") && (k.includes("student") || k.includes("dashboard"))) ||
        (url.includes("action") && (k.includes("action") || k.includes("dashboard"))) ||
        (url.includes("issue") && (k.includes("issue") || k.includes("dashboard"))) ||
        (url.includes("notification") && k.includes("notification")) ||
        (url.includes("profile") && (k.includes("profile") || k.includes("auth/me")))
      ) {
        safeRemoveItem(k);
      }
    });
  } catch {}
}

api.interceptors.request.use((config) => {
  const token = safeGetItem("maa_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // If browser is actively offline and it's a GET request, check cache before network
  if (typeof navigator !== "undefined" && !navigator.onLine && config.method?.toLowerCase() === "get") {
    const cachedData = getCachedResponse(config.url || "", config.params);
    if (cachedData !== null) {
      (config as any).__offlineCachedData = cachedData;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    // Save successful GET requests to offline cache
    if (response.config.method?.toLowerCase() === "get" && response.status === 200 && response.data) {
      saveToCache(response.config, response.data);
    } else if (
      response.config.method &&
      ["post", "put", "patch", "delete"].includes(response.config.method.toLowerCase())
    ) {
      invalidateRelatedCache(response.config.url);
    }
    return response;
  },
  (error) => {
    const config = error?.config as InternalAxiosRequestConfig | undefined;

    // Handle 401 Unauthorized
    if (error?.response?.status === 401) {
      safeRemoveItem("maa_token");
      safeRemoveItem("maa_user");
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/welcome")
      ) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Offline or Network Error Fallback for GET requests
    const isNetworkError =
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      (typeof navigator !== "undefined" && !navigator.onLine);

    if (config && config.method?.toLowerCase() === "get" && isNetworkError) {
      const cached = (config as any).__offlineCachedData || getCachedResponse(config.url || "", config.params);
      if (cached !== null) {
        const syntheticResponse: AxiosResponse = {
          data: cached,
          status: 200,
          statusText: "OK (Offline Cache)",
          headers: { "x-offline-cached": "true" },
          config,
        };
        (syntheticResponse as any).isOfflineCached = true;

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("mentorhub:offline-fallback", {
              detail: { url: config.url, timestamp: Date.now() },
            })
          );
        }

        return Promise.resolve(syntheticResponse);
      }
    }

    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const anyErr = err as any;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "You appear to be offline. Please check your network connection.";
  }
  return anyErr?.response?.data?.message ?? anyErr?.message ?? fallback;
}
