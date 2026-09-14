import { create } from "zustand";
import { api, setAccessToken } from "../api/client";

interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  subscription_status: "none" | "trialing" | "active" | "expired";
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ access_token: string }>("/auth/login", {
        email,
        name: "ignored",
        password,
      });
      setAccessToken(response.data.access_token);

      const me = await api.get<User>("/users/me");
      set({ user: me.data, isLoading: false });
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Login failed";
      set({ error: detail, isLoading: false });
      throw err;
    }
  },
  register: async (email, name, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/auth/register", { email, name, password });

      const response = await api.post<{ access_token: string }>("/auth/login", {
        email,
        name: "ignored",
        password,
      });
      setAccessToken(response.data.access_token);

      const me = await api.get<User>("/users/me");
      set({ user: me.data, isLoading: false });
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Registration failed";
      set({ error: detail, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    setAccessToken(null);
    set({ user: null, error: null });
  },

  bootstrap: async () => {
    set({ isLoading: true });
    try {
      const response = await api.post<{ access_token: string }>("/auth/refresh");
      setAccessToken(response.data.access_token);
      const me = await api.get<User>("/users/me");
      set({ user: me.data, isLoading: false });
    } catch {
      setAccessToken(null);
      set({ user: null, isLoading: false });
    }
  },
}));
