export type Role = "user" | "agent" | "admin";
export type Category = "building" | "land";
export type ListingType = "sale" | "rent" | "lease" | "shortlet";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type PricePeriod = "total" | "per_year" | "per_month" | "per_night";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  agency?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface PropertyOwner {
  _id: string;
  name: string;
  agency?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface Property {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: Category;
  listingType: ListingType;
  price: number;
  currency: string;
  pricePeriod: PricePeriod;
  location: { address?: string; area: string; city: string; state: string };
  size?: number;
  buildingType?: string;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  parking?: number;
  furnished?: boolean;
  landUse?: string;
  titleDocument?: string;
  features: string[];
  images: { url: string; publicId?: string }[];
  /** Only present on admin dashboard responses — public pages never receive it. */
  owner?: PropertyOwner | string;
  /** Only on an agent's own listings: how many enquiries Acme received for it. */
  inquiryCount?: number;
  status: ApprovalStatus;
  rejectionReason?: string;
  isFeatured: boolean;
  isAvailable: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  property?: { _id: string; title: string; slug: string };
  status: "new" | "read" | "closed";
  createdAt: string;
}

export interface ListingStats {
  byStatus: Partial<Record<ApprovalStatus, number>>;
  byCategory: Partial<Record<Category, number>>;
  totalViews: number;
}

export interface PropertyFilters {
  category?: Category;
  listingType?: ListingType;
  buildingType?: string;
  landUse?: string;
  city?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  q?: string;
  featured?: boolean;
  status?: ApprovalStatus;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  limit?: number;
}
