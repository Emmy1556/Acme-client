import { Link } from "react-router";
import { Bath, BedDouble, CalendarClock, FileCheck2, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/lib/types";
import {
  FALLBACK_IMAGE,
  LISTING_BADGE,
  SOLD_LABEL,
  capitalize,
  hasPaymentPlan,
  hasPriceRange,
  imageUrl,
  locationLabel,
  priceLabel,
  sizeLabel,
} from "@/lib/format";

/** Red diagonal corner ribbon for sold / let listings. The parent must be `relative overflow-hidden`. */
export function SoldRibbon({ label, large }: { label: string; large?: boolean }) {
  return (
    <div
      className={
        large
          ? "pointer-events-none absolute top-8 -right-14 w-56 rotate-45 bg-red-600 py-2 text-center text-sm font-extrabold tracking-[0.25em] text-white uppercase shadow-lg"
          : "pointer-events-none absolute top-5 -right-11 w-40 rotate-45 bg-red-600 py-1 text-center text-xs font-extrabold tracking-[0.2em] text-white uppercase shadow-md"
      }
    >
      {label}
    </div>
  );
}

function Cover({ p, badge }: { p: Property; badge: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
      <img
        src={imageUrl(p.images[0]?.url)}
        alt={p.title}
        loading="lazy"
        onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
        // Crop from the top-left so the bottom-right watermark always stays in view.
        className={`size-full object-cover object-right-bottom transition-transform duration-500 group-hover:scale-105 ${p.isSold ? "grayscale-[40%]" : ""}`}
      />
      <span className="absolute left-3 top-3 rounded bg-brand-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-300">
        {badge}
      </span>
      {p.isSold && <SoldRibbon label={SOLD_LABEL[p.listingType]} />}
    </div>
  );
}

/** Card for houses / buildings. */
export function BuildingCard({ p }: { p: Property }) {
  return (
    <Link
      to={`/properties/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <Cover p={p} badge={LISTING_BADGE[p.listingType]} />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold group-hover:text-brand-600">{p.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="size-3.5" /> {locationLabel(p)}
        </p>
        <p className="mt-3 text-sm text-gray-500">
          {p.isSold ? (
            <span className="text-lg font-bold text-red-600">{SOLD_LABEL[p.listingType]}</span>
          ) : (
            <>
              From <span className="text-lg font-bold text-brand-600">{priceLabel(p)}</span>
            </>
          )}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 pt-4 text-sm whitespace-nowrap text-gray-600">
          <span className="flex items-center gap-1.5">
            <BedDouble className="size-4 text-brand-500" /> {p.bedrooms ?? 0} Beds
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="size-4 text-brand-500" /> {p.bathrooms ?? 0} Baths
          </span>
          {p.size ? (
            <span className="flex items-center gap-1.5">
              <Ruler className="size-4 text-brand-500" /> {p.size} sqm
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

/** Card for land listings. */
export function LandCard({ p }: { p: Property }) {
  return (
    <Link
      to={`/properties/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <Cover p={p} badge={capitalize(p.landUse) || "Land"} />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-bold group-hover:text-brand-600">{p.title}</h3>
        <div className="mt-3 space-y-1.5 pb-4 text-sm text-gray-600">
          {p.size ? (
            <p className="flex items-center gap-1.5">
              <Ruler className="size-4 text-brand-500" /> {sizeLabel(p)}
            </p>
          ) : null}
          {p.titleDocuments?.length ? (
            <p className="flex items-center gap-1.5" title={p.titleDocuments.join(", ")}>
              <FileCheck2 className="size-4 shrink-0 text-brand-500" />
              <span className="truncate">{p.titleDocuments[0]}</span>
              {p.titleDocuments.length > 1 && (
                <span className="shrink-0 text-xs font-semibold text-brand-600">+{p.titleDocuments.length - 1} more</span>
              )}
            </p>
          ) : null}
          {!p.isSold && hasPaymentPlan(p) && (
            <p className="flex items-center gap-1.5 font-medium text-brand-700">
              <CalendarClock className="size-4 text-brand-500" /> Payment plan available
            </p>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
          {p.isSold ? (
            <span className="text-lg font-bold text-red-600">{SOLD_LABEL[p.listingType]}</span>
          ) : (
            <span className="text-lg font-bold text-brand-600">
              {hasPriceRange(p) && <span className="mr-1 text-xs font-medium text-gray-500">From</span>}
              {priceLabel(p)}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="size-3.5" /> {locationLabel(p)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function PropertyCard({ p }: { p: Property }) {
  return p.category === "land" ? <LandCard p={p} /> : <BuildingCard p={p} />;
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
      <div className="aspect-[4/3] animate-pulse bg-gray-100" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}
