import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Check, Eye, Handshake, Pencil, RotateCcw, Star, Trash2, X } from "lucide-react";
import { clsx } from "clsx";
import type { Property, PropertyOwner } from "@/lib/types";
import {
  FALLBACK_IMAGE,
  LISTING_BADGE,
  SOLD_LABEL,
  capitalize,
  formatPrice,
  hasPriceRange,
  imageUrl,
  locationLabel,
  priceLabel,
  sqm,
} from "@/lib/format";
import { Badge, StatusBadge } from "@/components/ui/Feedback";
import { useDeleteProperty, useFeatureProperty, useMarkSold, useModerateProperty, useSetPlotsSoldOut } from "@/hooks/queries";
import { errorMessage } from "@/lib/api";

const iconBtn = "rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900";

export function ListingsTable({ items, base, admin }: { items: Property[]; base: string; admin?: boolean }) {
  const del = useDeleteProperty();
  const moderate = useModerateProperty();
  const feature = useFeatureProperty();
  const markSold = useMarkSold();
  const [confirmSold, setConfirmSold] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);
  const setPlotsSoldOut = useSetPlotsSoldOut();
  /** Land with several plot sizes: which sizes are ticked as sold out in the box. */
  const [plotsFor, setPlotsFor] = useState<Property | null>(null);
  const [soldOutIds, setSoldOutIds] = useState<string[]>([]);

  // Esc closes whichever confirmation box is open.
  useEffect(() => {
    if (!confirmSold && !deleting && !plotsFor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setConfirmSold(null);
      setDeleting(null);
      setPlotsFor(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmSold, deleting, plotsFor]);
  const [rejecting, setRejecting] = useState<Property | null>(null);
  const [reason, setReason] = useState("");

  const onDelete = (p: Property) =>
    del.mutate(p._id, {
      onSuccess: () => {
        toast.success("Listing deleted");
        setDeleting(null);
      },
      onError: (e) => toast.error(errorMessage(e)),
    });

  const setSold = (p: Property, isSold: boolean) => {
    const label = SOLD_LABEL[p.listingType].toLowerCase();
    markSold.mutate(
      { id: p._id, isSold },
      {
        onSuccess: () => {
          toast.success(isSold ? `"${p.title}" marked as ${label}` : `"${p.title}" is available again`);
          setConfirmSold(null);
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  // Marking sold asks first (it changes what the public sees); undoing is instant.
  const toggleSold = (p: Property) => {
    if ((p.plots?.length ?? 0) > 1) {
      setSoldOutIds((p.plots ?? []).filter((x) => x.isSoldOut && x._id).map((x) => x._id!));
      setPlotsFor(p);
      return;
    }
    if (p.isSold) setSold(p, false);
    else setConfirmSold(p);
  };

  const savePlots = () => {
    if (!plotsFor) return;
    const p = plotsFor;
    const allGone = soldOutIds.length === (p.plots?.length ?? 0);
    setPlotsSoldOut.mutate(
      { id: p._id, soldOut: soldOutIds },
      {
        onSuccess: () => {
          toast.success(allGone ? `Every size sold — "${p.title}" now shows as sold` : "Plot sizes updated");
          setPlotsFor(null);
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
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
              {!admin && <th className="px-4 py-3 font-semibold">Enquiries</th>}
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
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    {hasPriceRange(p) && <span className="mr-1 text-xs font-normal text-gray-500">From</span>}
                    {priceLabel(p)}
                    {(p.plots?.length ?? 0) > 1 && (
                      <span className="block text-xs font-normal text-gray-400">
                        {p.plots!.length} sizes{p.plots!.some((x) => x.isSoldOut) ? ` · ${p.plots!.filter((x) => x.isSoldOut).length} sold out` : ""}
                      </span>
                    )}
                  </td>
                  {admin && <td className="px-4 py-3 text-gray-600">{owner?.agency || owner?.name}</td>}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge status={p.status} />
                      {p.isSold && <Badge tone="red">{SOLD_LABEL[p.listingType]}</Badge>}
                    </div>
                    {p.status === "rejected" && p.rejectionReason && (
                      <p className="mt-1 max-w-40 truncate text-xs text-red-600" title={p.rejectionReason}>
                        {p.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.views}</td>
                  {!admin && <td className="px-4 py-3 text-gray-600">{p.inquiryCount ?? 0}</td>}
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
                      {p.status === "approved" && (
                        <button
                          className={clsx(iconBtn, p.isSold ? "text-red-600" : "hover:text-red-600")}
                          title={
                            (p.plots?.length ?? 0) > 1
                              ? "Mark plot sizes as sold out"
                              : p.isSold
                                ? "Mark as available again"
                                : `Mark as ${SOLD_LABEL[p.listingType].toLowerCase()}`
                          }
                          onClick={() => toggleSold(p)}
                          disabled={markSold.isPending}
                        >
                          {p.isSold && (p.plots?.length ?? 0) <= 1 ? <RotateCcw className="size-4" /> : <Handshake className="size-4" />}
                        </button>
                      )}
                      <Link to={`/properties/${p.slug}`} className={iconBtn} title="View">
                        <Eye className="size-4" />
                      </Link>
                      <Link to={`${base}/listings/${p.slug}/edit`} className={iconBtn} title="Edit">
                        <Pencil className="size-4" />
                      </Link>
                      <button className={clsx(iconBtn, "hover:text-red-600")} title="Delete" onClick={() => setDeleting(p)}>
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

      {plotsFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal
          aria-labelledby="plots-title"
          onClick={() => setPlotsFor(null)}
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <Handshake className="size-5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <h2 id="plots-title" className="text-lg font-bold">
                    Which sizes are sold out?
                  </h2>
                  <p className="mt-1 truncate text-sm font-medium text-gray-700">“{plotsFor.title}”</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2">
                {(plotsFor.plots ?? []).map((x) => {
                  const id = x._id ?? "";
                  const on = soldOutIds.includes(id);
                  return (
                    <li key={id}>
                      <label
                        className={clsx(
                          "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition",
                          on ? "border-red-200 bg-red-50" : "border-gray-200 hover:border-gray-300",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="size-4 accent-red-600"
                          checked={on}
                          onChange={() => setSoldOutIds((ids) => (on ? ids.filter((i) => i !== id) : [...ids, id]))}
                        />
                        <span className={clsx("font-semibold", on ? "text-gray-400 line-through" : "text-gray-900")}>{sqm(x.size)}</span>
                        <span className={clsx("text-sm", on ? "text-gray-400 line-through" : "text-gray-600")}>
                          {formatPrice(x.price, plotsFor.currency)}
                        </span>
                        {on && <span className="ml-auto text-xs font-bold tracking-wide text-red-600 uppercase">Sold out</span>}
                      </label>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 flex gap-3 text-xs">
                <button
                  type="button"
                  className="font-medium text-red-600 hover:underline"
                  onClick={() => setSoldOutIds((plotsFor.plots ?? []).map((x) => x._id ?? ""))}
                >
                  All sold out
                </button>
                <button type="button" className="font-medium text-gray-500 hover:underline" onClick={() => setSoldOutIds([])}>
                  All available
                </button>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                Sold-out sizes show crossed out with a red tag. When every size is sold out, the whole listing shows as sold.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                type="button"
                autoFocus
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                onClick={() => setPlotsFor(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                disabled={setPlotsSoldOut.isPending}
                onClick={savePlots}
              >
                {setPlotsSoldOut.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal
          aria-labelledby="delete-title"
          onClick={() => setDeleting(null)}
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 p-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="size-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <h2 id="delete-title" className="text-lg font-bold">
                  Delete this listing?
                </h2>
                <p className="mt-1 truncate text-sm font-medium text-gray-700">“{deleting.title}”</p>
                <p className="mt-3 text-sm text-gray-500">
                  {deleting.images.length
                    ? `The listing and its ${deleting.images.length} photo${deleting.images.length === 1 ? "" : "s"} will be permanently removed.`
                    : "The listing will be permanently removed."}{" "}
                  This can’t be undone.
                </p>
                {!deleting.isSold && deleting.status === "approved" && (
                  <p className="mt-2 text-sm text-gray-500">
                    Was it sold? Use <span className="font-medium text-gray-700">Mark as {SOLD_LABEL[deleting.listingType].toLowerCase()}</span>{" "}
                    instead to keep it on the site as a closed deal.
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                type="button"
                autoFocus
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                onClick={() => setDeleting(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                disabled={del.isPending}
                onClick={() => onDelete(deleting)}
              >
                <Trash2 className="size-4" />
                {del.isPending ? "Deleting…" : "Delete listing"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmSold && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal
          aria-labelledby="sold-title"
          onClick={() => setConfirmSold(null)}
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 p-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50">
                <Handshake className="size-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <h2 id="sold-title" className="text-lg font-bold">
                  Mark as {SOLD_LABEL[confirmSold.listingType].toLowerCase()}?
                </h2>
                <p className="mt-1 truncate text-sm font-medium text-gray-700">“{confirmSold.title}”</p>
                <ul className="mt-3 space-y-1.5 text-sm text-gray-500">
                  <li>• Stays on the site with a red “{SOLD_LABEL[confirmSold.listingType]}” badge</li>
                  <li>• Stops taking enquiries</li>
                  <li>• Moves below available listings</li>
                </ul>
                <p className="mt-3 text-xs text-gray-400">You can undo this anytime from this table.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                type="button"
                autoFocus
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                onClick={() => setConfirmSold(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                disabled={markSold.isPending}
                onClick={() => setSold(confirmSold, true)}
              >
                <Handshake className="size-4" />
                {markSold.isPending ? "Saving…" : `Mark as ${SOLD_LABEL[confirmSold.listingType].toLowerCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}

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
