import { create } from "zustand";
import type { User } from "@/lib/types";

type Status = "loading" | "authenticated" | "guest";

interface AuthState {
  user: User | null;
  /** Kept in memory only — the refresh token lives in an httpOnly cookie. */
  accessToken: string | null;
  status: Status;
  setSession: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: "loading",
  setSession: (user, accessToken) => set({ user, accessToken, status: "authenticated" }),
  setUser: (user) => set({ user }),
  clear: () => set({ user: null, accessToken: null, status: "guest" }),
}));

export const dashboardPathFor = (role?: string) =>
  role === "admin" ? "/admin" : role === "agent" ? "/dashboard" : "/";
