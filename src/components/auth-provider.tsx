"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types";
import api, { clearAuthCache } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
  refreshUser: async () => {},
});

// Cache user data to avoid repeated API calls
let cachedUser: User | null = null;
let userCacheExpiry = 0;
const USER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(!cachedUser);

  /**
   * Load the profile for an already-authenticated user.
   *
   * `skipAuthCheck` is used when the caller already knows a session exists
   * (e.g. from an onAuthStateChange payload) so we avoid calling back into
   * supabase-js, which would deadlock inside its auth lock.
   */
  const fetchUser = useCallback(
    async (forceRefresh = false, skipAuthCheck = false) => {
      // Use cache if available and not forcing refresh
      if (!forceRefresh && cachedUser && Date.now() < userCacheExpiry) {
        setUser(cachedUser);
        setIsLoading(false);
        return;
      }

      try {
        let hasSession = skipAuthCheck;

        if (!skipAuthCheck) {
          const supabase = createClient();
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          hasSession = !!authUser;
        }

        if (hasSession) {
          try {
            const response = await api.get("/auth/me");
            const userData = response.data;

            // Update cache
            cachedUser = userData;
            userCacheExpiry = Date.now() + USER_CACHE_DURATION;

            setUser(userData);
          } catch {
            setUser(null);
            cachedUser = null;
          }
        } else {
          setUser(null);
          cachedUser = null;
        }
      } catch {
        setUser(null);
        cachedUser = null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUser();

    const supabase = createClient();
    // The callback must stay synchronous: supabase-js invokes it while holding
    // its auth lock, so awaiting another auth call here deadlocks the client
    // and every subsequent request silently hangs.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          // Defer past the lock, and trust the session from the event payload
          setTimeout(() => {
            void fetchUser(true, !!session);
          }, 0);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          cachedUser = null;
          userCacheExpiry = 0;
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    cachedUser = null;
    userCacheExpiry = 0;
    clearAuthCache();
  };

  const refreshUser = useCallback(async () => {
    await fetchUser(true);
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
