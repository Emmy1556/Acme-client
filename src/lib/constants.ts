export const LISTING_TYPES = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
  { value: "lease", label: "For Lease" },
  { value: "shortlet", label: "Short-Let" },
] as const;

export const BUILDING_TYPES = [
  "apartment",
  "duplex",
  "terrace",
  "bungalow",
  "detached",
  "semi-detached",
  "penthouse",
  "studio",
  "commercial",
] as const;

export const LAND_USES = ["residential", "commercial", "agricultural", "industrial", "mixed"] as const;

export const TITLE_DOCUMENTS = [
  "C of O",
  "C of O in View",
  "Governor's Consent",
  "Registered Survey",
  "Registered Survey & Deed of Assignment",
  "Deed of Assignment",
  "Excision",
  "Gazette",
  "Family Receipt",
] as const;

export const PRICE_PERIODS = [
  { value: "total", label: "Outright" },
  { value: "per_year", label: "Per year" },
  { value: "per_month", label: "Per month" },
  { value: "per_night", label: "Per night" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "popular", label: "Most viewed" },
] as const;

export const CONTACT = {
  phone: "+2347083107256",
  email: "acmehomesandproperties@gmail.com",
  address: "Lagos, Nigeria",
};
