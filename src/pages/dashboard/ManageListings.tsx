import { useState } from "react";
import { Link } from "react-router";
import { PlusCircle } from "lucide-react";
import { PageHeader, useDashboardBase } from "@/components/layout/DashboardLayout";
import { ListingsTable } from "@/components/dashboard/ListingsTable";
import { EmptyState, Pagination, Spinner } from "@/components/ui/Feedback";
import { Input, Select } from "@/components/ui/Field";
import { buttonClass } from "@/components/ui/Button";
import { useAdminProperties, useMyProperties } from "@/hooks/queries";
import type { PropertyFilters } from "@/lib/types";

/** Used for both the agent's "My Listings" and the admin's "All Listings" (with moderation). */
export default function ManageListings({ admin = false }: { admin?: boolean }) {
  const base = useDashboardBase();
  const [filters, setFilters] = useState<PropertyFilters>({ page: 1, limit: 15, status: admin ? "pending" : undefined });
  const mine = useMyProperties(filters, !admin);
  const all = useAdminProperties(filters, admin);
  const { data, isLoading } = admin ? all : mine;
  const update = (patch: Partial<PropertyFilters>) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  return (
    <>
      <PageHeader
        title={admin ? "All Listings" : "My Listings"}
        subtitle={admin ? "Review agent submissions, feature listings on the home page, and manage everything on the site." : "Everything you've listed on Acme."}
        action={
          <Link to={`${base}/listings/new`} className={buttonClass()}>
            <PlusCircle className="size-4" /> {admin ? "Post property" : "Add listing"}
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        {admin && (
          <div className="flex rounded-lg bg-white p-1 ring-1 ring-gray-200">
            {(["pending", "approved", "rejected", undefined] as const).map((s) => (
              <button
                key={s ?? "all"}
                onClick={() => update({ status: s })}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${filters.status === s ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {s ?? "All"}
              </button>
            ))}
          </div>
        )}
        {!admin && (
          <Select className="w-40" value={filters.status ?? ""} onChange={(e) => update({ status: (e.target.value || undefined) as PropertyFilters["status"] })} aria-label="Status">
            <option value="">All statuses</option>
            <option value="approved">Live</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </Select>
        )}
        <Select className="w-40" value={filters.category ?? ""} onChange={(e) => update({ category: (e.target.value || undefined) as PropertyFilters["category"] })} aria-label="Category">
          <option value="">All categories</option>
          <option value="building">Buildings</option>
          <option value="land">Lands</option>
        </Select>
        <Input
          className="w-64"
          placeholder="Search title or area…"
          defaultValue={filters.q}
          onKeyDown={(e) => e.key === "Enter" && update({ q: e.currentTarget.value || undefined })}
          onBlur={(e) => update({ q: e.target.value || undefined })}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : data?.items.length ? (
        <>
          <ListingsTable items={data.items} base={base} admin={admin} />
          <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={(page) => setFilters((f) => ({ ...f, page }))} />
        </>
      ) : (
        <EmptyState title="Nothing here" message={admin && filters.status === "pending" ? "No listings are waiting for review. 🎉" : "No listings match these filters."} />
      )}
    </>
  );
}
