import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, cleanParams } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import type {
  ApprovalStatus,
  Inquiry,
  ListingStats,
  Paginated,
  Property,
  PropertyFilters,
  Role,
  User,
} from "@/lib/types";

type Envelope<T> = { success: boolean; data: T; message?: string };

/* ---------------- public ---------------- */

export function useProperties(filters: PropertyFilters) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: async () =>
      (await api.get<Envelope<Paginated<Property>>>("/properties", { params: cleanParams(filters) })).data.data,
    placeholderData: keepPreviousData,
  });
}

export function useProperty(slug?: string) {
  // Wait for the session to be restored so owners/admins can preview unapproved listings on a hard reload.
  const authReady = useAuth((s) => s.status !== "loading");
  const userId = useAuth((s) => s.user?._id);
  return useQuery({
    queryKey: ["property", slug, userId],
    enabled: !!slug && authReady,
    queryFn: async () =>
      (await api.get<Envelope<{ property: Property; similar: Property[] }>>(`/properties/${slug}`)).data.data,
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () =>
      (await api.get<Envelope<{ city: string; areas: string[]; count: number }[]>>("/properties/locations")).data.data,
  });
}

export function useSendInquiry() {
  return useMutation({
    mutationFn: async (body: {
      name: string;
      email: string;
      phone?: string;
      subject?: string;
      message: string;
      property?: string;
    }) => (await api.post<Envelope<{ id: string }>>("/inquiries", body)).data,
  });
}

/* ---------------- dashboard ---------------- */

export function useMyProperties(filters: PropertyFilters, enabled = true) {
  return useQuery({
    queryKey: ["properties", "mine", filters],
    enabled,
    queryFn: async () =>
      (await api.get<Envelope<Paginated<Property>>>("/properties/mine", { params: cleanParams(filters) })).data.data,
    placeholderData: keepPreviousData,
  });
}

export function useAdminProperties(filters: PropertyFilters, enabled = true) {
  return useQuery({
    queryKey: ["properties", "admin", filters],
    enabled,
    queryFn: async () =>
      (await api.get<Envelope<Paginated<Property>>>("/properties/admin", { params: cleanParams(filters) })).data.data,
    placeholderData: keepPreviousData,
  });
}

export type PropertyInput = Omit<
  Property,
  "_id" | "slug" | "owner" | "status" | "rejectionReason" | "isFeatured" | "views" | "createdAt" | "updatedAt" | "currency" | "isAvailable"
> & { isAvailable?: boolean };

function useInvalidateProperties() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["properties"] });
    qc.invalidateQueries({ queryKey: ["property"] });
    qc.invalidateQueries({ queryKey: ["stats"] });
  };
}

export function useSaveProperty() {
  const invalidate = useInvalidateProperties();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: Partial<PropertyInput> }) =>
      id
        ? (await api.patch<Envelope<Property>>(`/properties/${id}`, data)).data.data
        : (await api.post<Envelope<Property>>("/properties", data)).data.data,
    onSuccess: invalidate,
  });
}

export function useDeleteProperty() {
  const invalidate = useInvalidateProperties();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/properties/${id}`),
    onSuccess: invalidate,
  });
}

export function useModerateProperty() {
  const invalidate = useInvalidateProperties();
  return useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: ApprovalStatus; rejectionReason?: string }) =>
      api.patch(`/properties/${id}/status`, { status, rejectionReason }),
    onSuccess: invalidate,
  });
}

export function useFeatureProperty() {
  const invalidate = useInvalidateProperties();
  return useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      api.patch(`/properties/${id}/feature`, { isFeatured }),
    onSuccess: invalidate,
  });
}

export function useUploadImages() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const form = new FormData();
      files.forEach((f) => form.append("images", f));
      return (await api.post<Envelope<{ url: string }[]>>("/uploads", form)).data.data;
    },
  });
}

export function useAgentStats() {
  return useQuery({
    queryKey: ["stats", "agent"],
    queryFn: async () =>
      (await api.get<Envelope<{ listings: ListingStats; newInquiries: number }>>("/stats/agent")).data.data,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["stats", "admin"],
    queryFn: async () =>
      (
        await api.get<Envelope<{ listings: ListingStats; users: number; agents: number; newInquiries: number }>>(
          "/stats/admin",
        )
      ).data.data,
  });
}

export function useInquiries(params: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ["inquiries", params],
    queryFn: async () =>
      (await api.get<Envelope<Paginated<Inquiry>>>("/inquiries", { params: cleanParams(params) })).data.data,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Inquiry["status"] }) =>
      api.patch(`/inquiries/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inquiries"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUsers(params: { role?: Role; q?: string; page?: number }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () =>
      (await api.get<Envelope<Paginated<User>>>("/users", { params: cleanParams(params) })).data.data,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pick<User, "role" | "isActive" | "isVerified">> }) =>
      api.patch(`/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
