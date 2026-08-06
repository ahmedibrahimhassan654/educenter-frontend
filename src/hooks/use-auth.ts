import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types";
import api from "@/lib/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone: string,
    role: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  },

  signUp: async (
    email: string,
    password: string,
    name: string,
    phone: string,
    role: string
  ) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      // Create user profile in MongoDB
      await api.post("/auth/register", {
        supabaseId: data.user.id,
        name,
        email,
        phone,
        role,
      });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const response = await api.get("/auth/me");
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },
}));