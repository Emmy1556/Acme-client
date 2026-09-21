import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Check, Eye, Pencil, Star, Trash2, X } from "lucide-react";
import { clsx } from "clsx";
import type { Property, PropertyOwner } from "@/lib/types";
import { FALLBACK_IMAGE, LISTING_BADGE, capitalize, imageUrl, locationLabel, priceLabel } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Feedback";
import { useDeleteProperty, useFeatureProperty, useModerateProperty } from "@/hooks/queries";
import { errorMessage } from "@/lib/api";

const iconBtn = "rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900";

export function ListingsTable({ items, base, admin }: { items: Property[]; base: string; admin?: boolean }) {
  const del = useDeleteProperty();
  const moderate = useModerateProperty();
  const feature = useFeatureProperty();
  const [rejecting, setRejecting] = useState<Property | null>(null);
  const [reason, setReason] = useState("");

  const onDelete = (p: Property) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    del.mutate(p._id, {
      onSuccess: () => toast.success("Listing deleted"),
      onError: (e) => toast.error(errorMessage(e)),
    });
  };

  const approve = (p: Property) =>
    moderate.mutate(
      { id: p._id, status: "approved" },
      { onSuccess: () => toast.success(`"${p.title}" is now live`), onError: (e) => toast.error(errorMessage(e)) },
    );

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Property</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              {admin && <th className="px-4 py-3 font-semibold">Owner</th>}
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Views</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((p) => {
              const owner = typeof p.owner === "object" ? (p.owner as PropertyOwner) : undefined;
              return (
                <tr key={p._id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={imageUrl(p.images[0]?.url)}
                        onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                        alt=""
                        className="size-12 shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1 truncate font-semibold text-gray-900">
                          {p.title}
                          {p.isFeatured && <Star className="size-3.5 fill-gold-400 text-gold-400" aria-label="Featured" />}
                        </p>
                        <p className="truncate text-xs text-gray-500">{locationLabel(p)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {capitalize(p.category)}
                    <span className="block text-xs text-gray-400">{LISTING_BADGE[p.listingType]}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{priceLabel(p)}</td>
                  {admin && <td className="px-4 py-3 text-gray-600">{owner?.agency || owner?.name}</td>}
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                    {p.status === "rejected" && p.rejectionReason && (
                      <p className="mt-1 max-w-40 truncate text-xs text-red-600" title={p.rejectionReason}>
                        {p.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.views}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {admin && p.status !== "approved" && (
                        <button className={clsx(iconBtn, "text-brand-600")} title="Approve" onClick={() => approve(p)}>
                          <Check className="size-4" />
                        </button>
                      )}
                      {admin && p.status !== "rejected" && (
                        <button className={clsx(iconBtn, "text-red-600")} title="Reject" onClick={() => setRejecting(p)}>
                          <X className="size-4" />
                        </button>
                      )}
                      {admin && p.status === "approved" && (
                        <button
                          className={iconBtn}
                          title={p.isFeatured ? "Remove from featured" : "Feature on home page"}
                          onClick={() => feature.mutate({ id: p._id, isFeatured: !p.isFeatured })}
                        >
                          <Star className={clsx("size-4", p.isFeatured && "fill-gold-400 text-gold-400")} />
                        </button>
                      )}
                      <Link to={`/properties/${p.slug}`} className={iconBtn} title="View">
                        <Eye className="size-4" />
                      </Link>
                      <Link to={`${base}/listings/${p.slug}/edit`} className={iconBtn} title="Edit">
                        <Pencil className="size-4" />
                      </Link>
                      <button className={clsx(iconBtn, "hover:text-red-600")} title="Delete" onClick={() => onDelete(p)}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
          <form
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onSubmit={(e) => {
              e.preventDefault();
              moderate.mutate(
                { id: rejecting._id, status: "rejected", rejectionReason: reason },
                {
                  onSuccess: () => {
                    toast.success("Listing rejected");
                    setRejecting(null);
                    setReason("");
                  },
                  onError: (err) => toast.error(errorMessage(err)),
                },
              );
            }}
          >
            <h2 className="text-lg font-bold">Reject “{rejecting.title}”</h2>
            <p className="mt-1 text-sm text-gray-500">The owner will see this reason and can edit and resubmit.</p>
            <textarea
              required
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-4 min-h-24 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-brand-500 focus:outline-none"
              placeholder="e.g. Photos are unclear, please upload better images"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100" onClick={() => setRejecting(null)}>
                Cancel
              </button>
              <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" disabled={moderate.isPending}>
                Reject listing
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
