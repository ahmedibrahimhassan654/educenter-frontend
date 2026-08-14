"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/types";
import api, { getStoredUser, getStoredToken, clearAuth, setAuth } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, token?: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
  updateUser: () => {},
});

let cachedUser: User | null = null;
let userCacheExpiry = 0;
const USER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(!cachedUser && !!getStoredUser());
  const isLoginPage = pathname?.startsWith("/login") ?? false;
  const isRegisterPage = pathname?.startsWith("/register") ?? false;

  const fetchUser = useCallback(
    async (forceRefresh = false) => {
      if (isLoginPage || isRegisterPage) {
        setUser(null);
        cachedUser = null;
        userCacheExpiry = 0;
        setIsLoading(false);
        return;
      }

      if (!forceRefresh && cachedUser && Date.now() < userCacheExpiry) {
        setUser(cachedUser);
        setIsLoading(false);
        return;
      }

      const storedUser = getStoredUser();
      if (!storedUser && !getStoredToken()) {
        setUser(null);
        cachedUser = null;
        userCacheExpiry = 0;
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        const userData = response.data;

        cachedUser = userData;
        userCacheExpiry = Date.now() + USER_CACHE_DURATION;

        setUser(userData);
      } catch (apiError: any) {
        console.error("API /auth/me error:", apiError?.response?.data || apiError?.message || apiError);
        const status = apiError?.response?.status;
        if (status === 401) {
          // Definitive auth failure (invalid/expired token): clear the session.
          setUser(null);
          cachedUser = null;
          userCacheExpiry = 0;
          clearAuth();
        } else {
          // Transient error (network, timeout, 5xx): keep the current session.
          // Only fall back to the stored user when no user is loaded yet, so
          // guards never bounce an authenticated user to /login.
          if (!cachedUser) {
            const fallback = getStoredUser();
            if (fallback) {
              cachedUser = fallback;
              userCacheExpiry = Date.now() + USER_CACHE_DURATION;
              setUser(fallback);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoginPage, isRegisterPage, router]
  );

  useEffect(() => {
    if (!pathname) {
      return;
    }

    if (isLoginPage || isRegisterPage) {
      setUser(null);
      cachedUser = null;
      userCacheExpiry = 0;
      setIsLoading(false);
      return;
    }

    fetchUser();
  }, [fetchUser, pathname]);

  const login = useCallback((userData: User, token?: string) => {
    if (token && typeof window !== "undefined") {
      setAuth(token, userData);
    }
    cachedUser = userData;
    userCacheExpiry = Date.now() + USER_CACHE_DURATION;
    setUser(userData);
    setIsLoading(false);
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout error:", e);
    }
    clearAuth();
    cachedUser = null;
    userCacheExpiry = 0;
    setUser(null);
    setIsLoading(false);
    router.push("/login");
  };

  const refreshUser = useCallback(async () => {
    await fetchUser(true);
  }, [fetchUser]);

  const updateUser = useCallback((userData: User) => {
    cachedUser = userData;
    userCacheExpiry = Date.now() + USER_CACHE_DURATION;
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        updateUser,
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
