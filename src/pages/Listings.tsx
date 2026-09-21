import { useSearchParams } from "react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useLocations, useProperties } from "@/hooks/queries";
import { CardSkeleton, PropertyCard } from "@/components/PropertyCard";
import { PageHero } from "@/components/layout/PublicLayout";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { LAND_USES, LISTING_TYPES, SORT_OPTIONS, BUILDING_TYPES } from "@/lib/constants";
import { capitalize } from "@/lib/format";
import type { Category, PropertyFilters } from "@/lib/types";

const num = (v: string | null) => (v ? Number(v) : undefined);

export default function Listings({ category }: { category: Category }) {
  const [params, setParams] = useSearchParams();
  const isLand = category === "land";
  const { data: locations } = useLocations();

  const filters: PropertyFilters = {
    category,
    q: params.get("q") ?? undefined,
    listingType: (params.get("listingType") as PropertyFilters["listingType"]) ?? undefined,
    buildingType: params.get("buildingType") ?? undefined,
    landUse: params.get("landUse") ?? undefined,
    city: params.get("city") ?? undefined,
    minPrice: num(params.get("minPrice")),
    maxPrice: num(params.get("maxPrice")),
    bedrooms: num(params.get("bedrooms")),
    sort: (params.get("sort") as PropertyFilters["sort"]) ?? "newest",
    page: num(params.get("page")) ?? 1,
    limit: 12,
  };
  const { data, isLoading, isFetching } = useProperties(filters);

  const set = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  const activeCount = [...params.keys()].filter((k) => !["page", "sort"].includes(k)).length;

  return (
    <>
      <PageHero
        title={isLand ? "Lands" : "Buildings"}
        subtitle={
          isLand
            ? "Residential, commercial and agricultural plots with verified title documents."
            : "Houses and apartments for sale, rent, lease and short-let."
        }
      />

      <section className="container-page py-10">
        {/* Filters */}
        <form
          className="grid gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:grid-cols-2 lg:grid-cols-6"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            set("q", (fd.get("q") as string) || undefined);
          }}
        >
          <Input name="q" defaultValue={filters.q} placeholder="Search area, estate…" className="lg:col-span-2" key={filters.q} />

          {isLand ? (
            <Select value={filters.landUse ?? ""} onChange={(e) => set("landUse", e.target.value)} aria-label="Land use">
              <option value="">Any land use</option>
              {LAND_USES.map((u) => (
                <option key={u} value={u}>
                  {capitalize(u)}
                </option>
              ))}
            </Select>
          ) : (
            <Select value={filters.listingType ?? ""} onChange={(e) => set("listingType", e.target.value)} aria-label="Listing type">
              <option value="">Any listing type</option>
              {LISTING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          )}

          <Select value={filters.city ?? ""} onChange={(e) => set("city", e.target.value)} aria-label="City">
            <option value="">All cities</option>
            {locations?.map((l) => (
              <option key={l.city} value={l.city}>
                {l.city}
              </option>
            ))}
          </Select>

          {isLand ? (
            <Input
              type="number"
              min={0}
              placeholder="Max price (₦)"
              defaultValue={filters.maxPrice}
              onBlur={(e) => set("maxPrice", e.target.value)}
              aria-label="Maximum price"
            />
          ) : (
            <Select value={filters.bedrooms?.toString() ?? ""} onChange={(e) => set("bedrooms", e.target.value)} aria-label="Bedrooms">
              <option value="">Any beds</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}+ beds
                </option>
              ))}
            </Select>
          )}

          <Button type="submit">
            <SlidersHorizontal className="size-4" /> Apply
          </Button>

          {!isLand && (
            <Select
              value={filters.buildingType ?? ""}
              onChange={(e) => set("buildingType", e.target.value)}
              aria-label="Building type"
              className="lg:col-span-2"
            >
              <option value="">Any building type</option>
              {BUILDING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {capitalize(t)}
                </option>
              ))}
            </Select>
          )}
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            {data ? `${data.pagination.total} ${data.pagination.total === 1 ? "property" : "properties"} found` : " "}
            {isFetching && !isLoading && " · updating…"}
          </p>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button onClick={() => setParams({})} className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
                <X className="size-4" /> Clear filters
              </button>
            )}
            <Select value={filters.sort} onChange={(e) => set("sort", e.target.value)} className="w-48" aria-label="Sort by">
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
          {data?.items.map((p) => <PropertyCard key={p._id} p={p} />)}
        </div>

        {data && data.items.length === 0 && (
          <EmptyState title="No properties match your search" message="Try removing some filters or searching a different area." />
        )}

        {data && <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={(p) => set("page", String(p))} />}
      </section>
    </>
  );
}
