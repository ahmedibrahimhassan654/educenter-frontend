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

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const session = await getCachedSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear cached session on 401
      cachedSession = null;
      sessionExpiry = 0;
      
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

export default api;