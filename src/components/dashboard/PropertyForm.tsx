import { useRef, useState } from "react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { Building2, ImagePlus, LandPlot, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import type { Category, ListingType, PricePeriod, Property } from "@/lib/types";
import { BUILDING_TYPES, LAND_USES, LISTING_TYPES, PRICE_PERIODS, TITLE_DOCUMENTS } from "@/lib/constants";
import { capitalize, imageUrl } from "@/lib/format";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { RichTextarea } from "@/components/ui/RichTextarea";
import { useUploadImages, type PropertyInput } from "@/hooks/queries";
import { errorMessage } from "@/lib/api";

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
  titleDocument: string;
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
  titleDocument: p?.titleDocument ?? "",
  features: p?.features ?? [],
  images: p?.images ?? [],
  isAvailable: p?.isAvailable ?? true,
});

const optNum = (v: string) => (v === "" ? undefined : Number(v));

function toPayload(f: FormState): Partial<PropertyInput> {
  const isLand = f.category === "land";
  return {
    title: f.title,
    description: f.description,
    category: f.category,
    listingType: f.listingType,
    price: Number(f.price),
    pricePeriod: f.pricePeriod,
    location: { address: f.address || undefined, area: f.area, city: f.city, state: f.state },
    size: optNum(f.size),
    features: f.features,
    images: f.images,
    isAvailable: f.isAvailable,
    ...(isLand
      ? { landUse: f.landUse || undefined, titleDocument: f.titleDocument || undefined }
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
        const uploaded = await upload.mutateAsync(list.slice(i, i + UPLOAD_BATCH));
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
            <Field label="Price (₦)">
              <Input required type="number" min={0} {...bind("price")} />
            </Field>
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
          <Field label="Size (sqm)">
            <Input type="number" min={0} required={isLand} {...bind("size")} />
          </Field>
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
            <Field label="Title document">
              <Select {...bind("titleDocument")}>
                <option value="">Select…</option>
                {TITLE_DOCUMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
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
        <p className="mt-3 text-xs text-gray-400">
          {f.images.length}/{MAX_PHOTOS} photos · JPEG, PNG, WEBP or AVIF · up to 8MB each · the cover photo is shown first
          everywhere. Every photo is watermarked automatically.
        </p>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input type="checkbox" checked={f.isAvailable} onChange={(e) => set("isAvailable", e.target.checked)} className="size-4 accent-brand-600" />
          Available (uncheck when sold / let)
        </label>
        <Button type="submit" size="lg" loading={submitting} disabled={!!uploading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
