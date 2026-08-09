import axios from "axios";
import { User } from "@/types";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL,
  timeout: 60000,
  withCredentials: true,
});

const TOKEN_KEY = "educenter_token";
const USER_KEY = "educenter_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// API Response Cache
interface CacheEntry {
  data: unknown;
  expiry: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 30 * 1000; // 30 seconds for GET requests
const LONG_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for rarely changing data

const longCacheEndpoints = ["/curriculum", "/groups?explore=true"];
const neverCacheEndpoints = ["/auth/"];

function getCacheKey(config: {
  method?: string;
  url?: string;
  params?: unknown;
}): string | null {
  if (config.method !== "get") return null;

  const url = config.url || "";
  if (neverCacheEndpoints.some((endpoint) => url.includes(endpoint))) return null;

  const params = JSON.stringify(config.params || {});
  return `${url}:${params}`;
}

function getCacheDuration(url: string): number {
  return longCacheEndpoints.some((endpoint) => url.includes(endpoint))
    ? LONG_CACHE_DURATION
    : CACHE_DURATION;
}

// Cache interceptor (no auth header needed - cookies sent automatically)
api.interceptors.request.use(async (config) => {
  const cacheKey = getCacheKey(config);
  if (cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return Promise.reject({
        __cached: true,
        data: cached.data,
        config,
      });
    }
  }

  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => {
    const cacheKey = getCacheKey(response.config);
    if (cacheKey) {
      const duration = getCacheDuration(response.config.url || "");
      responseCache.set(cacheKey, {
        data: response.data,
        expiry: Date.now() + duration,
      });
    }
    return response;
  },
  async (error) => {
    if (error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: "OK",
        headers: {},
        config: error.config,
      });
    }

    if (error.response?.status === 401) {
      clearAuth();
      responseCache.clear();
    }
    return Promise.reject(error);
  }
);

export function clearCache(pattern?: string) {
  if (!pattern) {
    responseCache.clear();
    return;
  }

  for (const key of Array.from(responseCache.keys())) {
    if (key.includes(pattern)) {
      responseCache.delete(key);
    }
  }
}

export default api;
