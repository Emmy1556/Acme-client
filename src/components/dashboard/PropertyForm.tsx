import { useRef, useState } from "react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { Building2, Check, ImagePlus, LandPlot, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import type { Category, ListingType, PricePeriod, Property } from "@/lib/types";
import { BUILDING_TYPES, LAND_USES, LISTING_TYPES, PRICE_PERIODS, TITLE_DOCUMENTS } from "@/lib/constants";
import { capitalize, formatPrice, imageUrl } from "@/lib/format";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { RichTextarea } from "@/components/ui/RichTextarea";
import { useUploadImages, type PropertyInput } from "@/hooks/queries";
import { errorMessage } from "@/lib/api";

/** One editable plot-size row (inputs are strings while typing). */
type PlotRow = { key: string; _id?: string; size: string; price: string; paymentPlan: string; isSoldOut?: boolean };

let rowSeq = 0;
const emptyPlot = (): PlotRow => ({ key: `new-${++rowSeq}`, size: "", price: "", paymentPlan: "" });

/** Land photos are stored without a watermark; their names end in "-nw". */
const isUnwatermarked = (url: string) => /-nw\.\w+$/.test(url);

type FormState = {
  title: string;
  description: string;
  category: Category;
  listingType: ListingType;
  price: string;
  pricePeriod: PricePeriod;
  address: string;
  area: string;
  city: string;
  state: string;
  size: string;
  buildingType: string;
  bedrooms: string;
  bathrooms: string;
  toilets: string;
  parking: string;
  furnished: boolean;
  landUse: string;
  titleDocuments: string[];
  plots: PlotRow[];
  features: string[];
  images: { url: string }[];
  isAvailable: boolean;
};

const fromProperty = (p?: Property): FormState => ({
  title: p?.title ?? "",
  description: p?.description ?? "",
  category: p?.category ?? "building",
  listingType: p?.listingType ?? "sale",
  price: p?.price?.toString() ?? "",
  pricePeriod: p?.pricePeriod ?? "total",
  address: p?.location.address ?? "",
  area: p?.location.area ?? "",
  city: p?.location.city ?? "Lagos",
  state: p?.location.state ?? "Lagos",
  size: p?.size?.toString() ?? "",
  buildingType: p?.buildingType ?? "",
  bedrooms: p?.bedrooms?.toString() ?? "",
  bathrooms: p?.bathrooms?.toString() ?? "",
  toilets: p?.toilets?.toString() ?? "",
  parking: p?.parking?.toString() ?? "",
  furnished: p?.furnished ?? false,
  landUse: p?.landUse ?? "",
  titleDocuments: p?.titleDocuments ?? [],
  plots: p?.plots?.length
    ? p.plots.map((x) => ({
        key: x._id ?? `p-${++rowSeq}`,
        _id: x._id,
        size: String(x.size),
        price: String(x.price),
        paymentPlan: x.paymentPlan ?? "",
        isSoldOut: x.isSoldOut,
      }))
    : p?.category === "land"
      ? // An older land listing with one size/price becomes the first row.
        [{ ...emptyPlot(), size: p.size?.toString() ?? "", price: p.price?.toString() ?? "" }]
      : [],
  features: p?.features ?? [],
  images: p?.images ?? [],
  isAvailable: p?.isAvailable ?? true,
});

const optNum = (v: string) => (v === "" ? undefined : Number(v));

function toPayload(f: FormState): Partial<PropertyInput> {
  const isLand = f.category === "land";
  const plots = f.plots
    .filter((r) => r.size !== "" && r.price !== "")
    .map((r) => ({
      ...(r._id ? { _id: r._id } : {}),
      size: Number(r.size),
      price: Number(r.price),
      isSoldOut: r.isSoldOut ?? false,
      paymentPlan: r.paymentPlan.trim() || undefined,
    }));
  // The server works these out from the plots too; sending them keeps the request valid.
  const open = plots.filter((x) => !x.isSoldOut);
  const landPrice = plots.length ? Math.min(...(open.length ? open : plots).map((x) => x.price)) : Number(f.price);
  const landSize = plots.length ? Math.min(...plots.map((x) => x.size)) : optNum(f.size);
  return {
    title: f.title,
    description: f.description,
    category: f.category,
    listingType: f.listingType,
    price: isLand ? landPrice : Number(f.price),
    pricePeriod: f.pricePeriod,
    location: { address: f.address || undefined, area: f.area, city: f.city, state: f.state },
    size: isLand ? landSize : optNum(f.size),
    features: f.features,
    images: f.images,
    isAvailable: f.isAvailable,
    ...(isLand
      ? { landUse: f.landUse || undefined, titleDocuments: f.titleDocuments, plots }
      : {
          buildingType: f.buildingType || undefined,
          bedrooms: optNum(f.bedrooms),
          bathrooms: optNum(f.bathrooms),
          toilets: optNum(f.toilets),
          parking: optNum(f.parking),
          furnished: f.furnished,
        }),
  };
}

/** Rows of size / price / payment plan for a land listing. */
function PlotEditor({ rows, onChange }: { rows: PlotRow[]; onChange: (rows: PlotRow[]) => void }) {
  const update = (key: string, patch: Partial<PlotRow>) => onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  return (
    <div className="sm:col-span-2">
      <p className="mb-1.5 text-sm font-medium text-gray-700">
        Plot sizes &amp; prices <span className="font-normal text-gray-400">(one row per size)</span>
      </p>
      <div className="space-y-3 sm:space-y-2">
        <div className="hidden gap-2 px-1 text-xs font-medium text-gray-500 sm:grid sm:grid-cols-[7rem_10rem_1fr_2.25rem]">
          <span>Size (sqm)</span>
          <span>Price (₦)</span>
          <span>Payment plan (optional)</span>
        </div>
        {rows.map((r) => (
          <div
            key={r.key}
            className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-2 sm:grid-cols-[7rem_10rem_1fr_2.25rem] sm:items-start sm:bg-transparent sm:p-0"
          >
            <Input
              required
              type="number"
              min={1}
              placeholder="300"
              aria-label="Size in sqm"
              value={r.size}
              onChange={(e) => update(r.key, { size: e.target.value })}
            />
            <div>
              <Input
                required
                type="number"
                min={0}
                placeholder="1000000"
                aria-label="Price in naira"
                value={r.price}
                onChange={(e) => update(r.key, { price: e.target.value })}
              />
              {r.price !== "" && <p className="mt-0.5 px-1 text-[11px] text-gray-400">{formatPrice(Number(r.price))}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Input
                maxLength={200}
                placeholder="e.g. 30% deposit, balance over 6 months"
                aria-label="Payment plan"
                value={r.paymentPlan}
                onChange={(e) => update(r.key, { paymentPlan: e.target.value })}
              />
              {r.isSoldOut && (
                <p className="mt-1 px-1 text-xs font-semibold text-red-600">Sold out — change this from your listings table</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onChange(rows.filter((x) => x.key !== r.key))}
              disabled={rows.length === 1}
              className="col-span-2 flex h-10 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent sm:col-span-1"
              aria-label="Remove this plot size"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...rows, emptyPlot()])}
        disabled={rows.length >= 30}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-brand-400 hover:text-brand-700"
      >
        <Plus className="size-4" /> Add plot size
      </button>
      <p className="mt-2 text-xs text-gray-400">
        Cards show “From” the cheapest size still available, plus the size range. Sizes are sorted smallest first automatically.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-5 text-base font-bold">{title}</h2>
      {children}
    </section>
  );
}

/** Must match the backend: `.max(25)` in property.schema.ts and `files: 10` in middleware/upload.ts. */
const MAX_PHOTOS = 25;
const UPLOAD_BATCH = 10;

export function PropertyForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial?: Property;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (data: Partial<PropertyInput>) => void;
}) {
  const [f, setF] = useState<FormState>(() => fromProperty(initial));
  const [featureDraft, setFeatureDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImages();
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const isLand = f.category === "land";

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const bind = (k: keyof FormState) => ({
    value: f[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      set(k, e.target.value as never),
  });

  const addFeature = () => {
    const v = featureDraft.trim();
    if (v && !f.features.includes(v)) set("features", [...f.features, v]);
    setFeatureDraft("");
  };

  /** Uploads in batches of UPLOAD_BATCH (the server's per-request limit), adding each batch as it lands. */
  const onFiles = async (files: FileList | null) => {
    const picked = Array.from(files ?? []);
    if (fileRef.current) fileRef.current.value = "";
    if (!picked.length) return;
    const room = MAX_PHOTOS - f.images.length;
    const list = picked.slice(0, room);
    if (picked.length > room) toast.info(`Only ${room} more photo${room === 1 ? "" : "s"} can be added (max ${MAX_PHOTOS}).`);
    if (!list.length) return;

    setUploading({ done: 0, total: list.length });
    try {
      for (let i = 0; i < list.length; i += UPLOAD_BATCH) {
        const uploaded = await upload.mutateAsync({ files: list.slice(i, i + UPLOAD_BATCH), category: f.category });
        setF((s) => ({ ...s, images: [...s.images, ...uploaded].slice(0, MAX_PHOTOS) }));
        setUploading({ done: Math.min(i + UPLOAD_BATCH, list.length), total: list.length });
      }
    } catch (e) {
      toast.error(errorMessage(e, "Upload failed"));
    } finally {
      setUploading(null);
    }
  };

  const makeCover = (url: string) =>
    setF((s) => {
      const img = s.images.find((x) => x.url === url);
      return img ? { ...s, images: [img, ...s.images.filter((x) => x.url !== url)] } : s;
    });

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(toPayload(f));
      }}
    >
      <Section title="What are you listing?">
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { value: "building", label: "Building / House", icon: Building2 },
              { value: "land", label: "Land", icon: LandPlot },
            ] as const
          ).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                set("category", value);
                if (value === "land" && f.listingType === "shortlet") set("listingType", "sale");
                if (value === "land" && f.plots.length === 0) set("plots", [emptyPlot()]);
              }}
              className={clsx(
                "flex items-center gap-3 rounded-lg border-2 p-4 text-left font-semibold transition",
                f.category === value ? "border-brand-600 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300",
              )}
              aria-pressed={f.category === value}
            >
              <Icon className="size-5" /> {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Basic details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2">
            <Input required minLength={3} maxLength={150} placeholder={isLand ? "e.g. 600sqm dry land at Crownwaters Estate" : "e.g. 3-bedroom terrace in Lekki Phase 1"} {...bind("title")} />
          </Field>
          <Field label="Listing type">
            <Select {...bind("listingType")}>
              {LISTING_TYPES.filter((t) => !(isLand && t.value === "shortlet")).map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            {isLand ? (
              <Field label="Price (₦)">
                <p className="flex h-10 items-center text-xs text-gray-500">Set per plot size below ↓</p>
              </Field>
            ) : (
              <Field label="Price (₦)">
                <Input required type="number" min={0} {...bind("price")} />
              </Field>
            )}
            <Field label="Price period">
              <Select {...bind("pricePeriod")}>
                {PRICE_PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Description" className="sm:col-span-2">
            <RichTextarea
              required
              minLength={10}
              maxLength={5000}
              value={f.description}
              onChange={(v) => set("description", v)}
              placeholder="Describe the property: layout, finishing, neighbourhood, what makes it stand out…"
            />
          </Field>
        </div>
      </Section>

      <Section title="Location">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Street address" hint="(optional)" className="sm:col-span-2">
            <Input {...bind("address")} />
          </Field>
          <Field label="Area / neighbourhood">
            <Input required placeholder="e.g. Lekki Phase 1" {...bind("area")} />
          </Field>
          <Field label="City">
            <Input required {...bind("city")} />
          </Field>
          <Field label="State">
            <Input required {...bind("state")} />
          </Field>
          {!isLand && (
            <Field label="Size (sqm)">
              <Input type="number" min={0} {...bind("size")} />
            </Field>
          )}
        </div>
      </Section>

      {isLand ? (
        <Section title="Land details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Land use">
              <Select required {...bind("landUse")}>
                <option value="">Select…</option>
                {LAND_USES.map((u) => (
                  <option key={u} value={u}>
                    {capitalize(u)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Title documents" hint="(select all that apply)" className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {TITLE_DOCUMENTS.map((d) => {
                  const on = f.titleDocuments.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        set("titleDocuments", on ? f.titleDocuments.filter((x) => x !== d) : [...f.titleDocuments, d])
                      }
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                        on
                          ? "border-brand-600 bg-brand-600 text-gold-300"
                          : "border-gray-300 bg-white text-gray-600 hover:border-brand-400 hover:text-brand-700",
                      )}
                    >
                      {on && <Check className="size-3.5" />}
                      {d}
                    </button>
                  );
                })}
              </div>
            </Field>
            <PlotEditor rows={f.plots} onChange={(rows) => set("plots", rows)} />
          </div>
        </Section>
      ) : (
        <Section title="Building details">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Building type">
              <Select {...bind("buildingType")}>
                <option value="">Select…</option>
                {BUILDING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {capitalize(t)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Bedrooms">
              <Input required type="number" min={0} {...bind("bedrooms")} />
            </Field>
            <Field label="Bathrooms">
              <Input type="number" min={0} {...bind("bathrooms")} />
            </Field>
            <Field label="Toilets">
              <Input type="number" min={0} {...bind("toilets")} />
            </Field>
            <Field label="Parking spaces">
              <Input type="number" min={0} {...bind("parking")} />
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={f.furnished} onChange={(e) => set("furnished", e.target.checked)} className="size-4 accent-brand-600" />
              Furnished
            </label>
          </div>
        </Section>
      )}

      <Section title="Features">
        <div className="flex gap-2">
          <Input
            value={featureDraft}
            onChange={(e) => setFeatureDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFeature();
              }
            }}
            placeholder={isLand ? "e.g. Good access road" : "e.g. Swimming pool"}
          />
          <Button type="button" variant="outline" onClick={addFeature}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
        {f.features.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {f.features.map((feat) => (
              <span key={feat} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-sm text-brand-700">
                {feat}
                <button
                  type="button"
                  onClick={() => set("features", f.features.filter((x) => x !== feat))}
                  className="rounded-full p-0.5 hover:bg-brand-100"
                  aria-label={`Remove ${feat}`}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </Section>

      <Section title="Photos">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {f.images.map((img, i) => (
            <div key={img.url} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
              <img src={imageUrl(img.url)} alt="" className="size-full object-cover" />
              {i === 0 ? (
                <span className="absolute left-1.5 top-1.5 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-gold-300">COVER</span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(img.url)}
                  className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-1 text-[11px] font-semibold text-brand-700 transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                  <Star className="size-3" />
                  Set as cover
                </button>
              )}
              <button
                type="button"
                onClick={() => set("images", f.images.filter((x) => x.url !== img.url))}
                className="absolute right-1.5 top-1.5 rounded-md bg-white/90 p-1 text-red-600 transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                aria-label="Remove photo"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          {f.images.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={!!uploading}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600"
            >
              {uploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
              {uploading ? `Uploading ${uploading.done}/${uploading.total}…` : "Add photos"}
            </button>
          )}
        </div>
        {!isLand && f.images.some((img) => isUnwatermarked(img.url)) && (
          <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
            Some photos were uploaded while this was a <strong>land</strong> listing, so they have no watermark. Remove them and
            upload them again — building photos must carry the Acme watermark.
          </p>
        )}
        <p className="mt-3 text-xs text-gray-400">
          {f.images.length}/{MAX_PHOTOS} photos · JPEG, PNG, WEBP or AVIF · up to 8MB each · the cover photo is shown first
          everywhere. {isLand ? "Land photos are not watermarked." : "Every photo is watermarked automatically."}
        </p>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input type="checkbox" checked={f.isAvailable} onChange={(e) => set("isAvailable", e.target.checked)} className="size-4 accent-brand-600" />
          Show on the site (uncheck to hide it for now — to show it as sold, use the handshake button in your listings table)
        </label>
        <Button type="submit" size="lg" loading={submitting} disabled={!!uploading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
