import axios from "axios";
import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";

// Singleton Supabase client for browser
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

// Cache the session to avoid repeated calls
let cachedSession: Session | null = null;
let sessionExpiry = 0;

async function getCachedSession() {
  const now = Date.now();
  if (cachedSession && now < sessionExpiry) {
    return cachedSession;
  }
  
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    cachedSession = session;
    // Cache for 5 minutes
    sessionExpiry = now + 5 * 60 * 1000;
  }
  
  return session;
}

// API Response Cache
interface CacheEntry {
  data: any;
  expiry: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 30 * 1000; // 30 seconds for GET requests
const LONG_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for rarely changing data

// Endpoints that can be cached longer
const longCacheEndpoints = ["/curriculum", "/groups?explore=true"];

function getCacheKey(config: any): string | null {
  // Only cache GET requests
  if (config.method !== "get") return null;
  
  const url = config.url || "";
  const params = JSON.stringify(config.params || {});
  return `${url}:${params}`;
}

function getCacheDuration(url: string): number {
  return longCacheEndpoints.some(endpoint => url.includes(endpoint)) 
    ? LONG_CACHE_DURATION 
    : CACHE_DURATION;
}

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const session = await getCachedSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  // Check cache for GET requests
  const cacheKey = getCacheKey(config);
  if (cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      // Return cached response
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
    // Cache successful GET responses
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
    // Handle cached responses
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
      // Clear cached session on 401
      cachedSession = null;
      sessionExpiry = 0;
      // Clear all response cache on auth error
      responseCache.clear();
      
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Helper to clear cache for specific endpoints
export function clearCache(pattern?: string) {
  if (!pattern) {
    responseCache.clear();
    return;
  }
  
  for (const key of responseCache.keys()) {
    if (key.includes(pattern)) {
      responseCache.delete(key);
    }
  }
}

export default api;
