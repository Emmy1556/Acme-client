import { Link } from "react-router";
import { Bath, BedDouble, FileCheck2, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/lib/types";
import { FALLBACK_IMAGE, LISTING_BADGE, capitalize, imageUrl, locationLabel, priceLabel } from "@/lib/format";

function Cover({ p, badge }: { p: Property; badge: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
      <img
        src={imageUrl(p.images[0]?.url)}
        alt={p.title}
        loading="lazy"
        onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute left-3 top-3 rounded bg-brand-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-300">
        {badge}
      </span>
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
          From <span className="text-lg font-bold text-brand-600">{priceLabel(p)}</span>
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
        <div className="mt-3 space-y-1.5 text-sm text-gray-600">
          {p.size ? (
            <p className="flex items-center gap-1.5">
              <Ruler className="size-4 text-brand-500" /> {p.size.toLocaleString()} Sqm
            </p>
          ) : null}
          {p.titleDocument && (
            <p className="flex items-center gap-1.5">
              <FileCheck2 className="size-4 text-brand-500" /> {p.titleDocument}
            </p>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-lg font-bold text-brand-600">{priceLabel(p)}</span>
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
