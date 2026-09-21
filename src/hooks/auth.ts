import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { api } from "@/lib/api";
import { dashboardPathFor, useAuth } from "@/stores/auth";
import type { User } from "@/lib/types";

type SessionRes = { data: { user: User; accessToken: string } };

export function useLogin(redirectTo?: string) {
  const setSession = useAuth((s) => s.setSession);
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) =>
      (await api.post<SessionRes>("/auth/login", body)).data.data,
    onSuccess: ({ user, accessToken }) => {
      qc.clear(); // never show the previous user's cached dashboard data
      setSession(user, accessToken);
      navigate(redirectTo ?? dashboardPathFor(user.role), { replace: true });
    },
  });
}

export function useRegister() {
  const setSession = useAuth((s) => s.setSession);
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      name: string;
      email: string;
      phone?: string;
      password: string;
      role: "user" | "agent";
      agency?: string;
    }) => (await api.post<SessionRes>("/auth/register", body)).data.data,
    onSuccess: ({ user, accessToken }) => {
      qc.clear();
      setSession(user, accessToken);
      navigate(dashboardPathFor(user.role), { replace: true });
    },
  });
}

export function useLogout() {
  const clear = useAuth((s) => s.clear);
  const navigate = useNavigate();
  const qc = useQueryClient();
  return async () => {
    await api.post("/auth/logout").catch(() => {});
    clear();
    qc.clear();
    navigate("/", { replace: true });
  };
}

export function useUpdateProfile() {
  const setUser = useAuth((s) => s.setUser);
  return useMutation({
    mutationFn: async (body: Partial<Pick<User, "name" | "phone" | "agency">>) =>
      (await api.patch<{ data: User }>("/auth/me", body)).data.data,
    onSuccess: setUser,
  });
}

export function useChangePassword() {
  const setSession = useAuth((s) => s.setSession);
  return useMutation({
    // Server signs out every other device and returns a fresh session for this one.
    mutationFn: async (body: { currentPassword: string; newPassword: string }) =>
      (await api.patch<SessionRes>("/auth/me/password", body)).data.data,
    onSuccess: ({ user, accessToken }) => setSession(user, accessToken),
  });
}
