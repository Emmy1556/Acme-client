import type { ListingType, PricePeriod, Property } from "./types";

const API_ORIGIN = import.meta.env.VITE_API_URL ?? "";

export function formatPrice(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("NGN", "₦");
}

const PERIOD_SUFFIX: Record<PricePeriod, string> = {
  total: "",
  per_year: "/yr",
  per_month: "/mo",
  per_night: "/night",
};

export const priceLabel = (p: Pick<Property, "price" | "currency" | "pricePeriod">) =>
  `${formatPrice(p.price, p.currency)}${PERIOD_SUFFIX[p.pricePeriod] ?? ""}`;

export const LISTING_BADGE: Record<ListingType, string> = {
  sale: "For Sale",
  rent: "For Rent",
  lease: "For Lease",
  shortlet: "Short-Let",
};

export const capitalize = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

/** Local dev uploads come back as `/uploads/...`; Cloudinary uploads are full https URLs and pass through. */
export const imageUrl = (url?: string) => {
  if (!url) return FALLBACK_IMAGE;
  return url.startsWith("/uploads") ? `${API_ORIGIN}${url}` : url;
};

export const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260"><rect width="400" height="260" fill="#e8f2ee"/><path d="M200 80 130 135h18v55h36v-35h32v35h36v-55h18z" fill="#8fbfae"/></svg>`,
  );

export const locationLabel = (p: Pick<Property, "location">) =>
  [p.location.area, p.location.city].filter(Boolean).join(", ");

export const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, name] of units) {
    const n = Math.floor(s / secs);
    if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
};
