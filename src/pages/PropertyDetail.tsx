import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Car,
  CheckCircle2,
  Expand,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileCheck2,
  Home as HomeIcon,
  LandPlot,
  Mail,
  MapPin,
  Phone,
  Ruler,
  ShieldCheck,
  Sofa,
  X,
} from "lucide-react";
import { useProperty, useSendInquiry } from "@/hooks/queries";
import { errorMessage } from "@/lib/api";
import { FALLBACK_IMAGE, LISTING_BADGE, capitalize, imageUrl, locationLabel, priceLabel } from "@/lib/format";
import type { Property } from "@/lib/types";
import { Badge, EmptyState, Spinner, StatusBadge } from "@/components/ui/Feedback";
import { Button, buttonClass } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { PropertyCard } from "@/components/PropertyCard";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { CONTACT } from "@/lib/constants";
import { FormattedText } from "@/components/FormattedText";

function Gallery({ p }: { p: Property }) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const images = p.images.length ? p.images : [{ url: "" }];
  const count = images.length;
  const go = (step: number) => setActive((i) => (i + step + count) % count);

  // Full-screen viewer: arrow keys / Esc, and stop the page scrolling underneath.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [fullscreen, count]);

  const arrow =
    "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow-md transition hover:bg-white";

  return (
    <div>
      {/* Fills the frame (object-cover). The watermark is centred, so cropping never hides it. */}
      <div className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-brand-50">
        <button
          type="button"
          onClick={() => p.images.length && setFullscreen(true)}
          className="block size-full cursor-zoom-in"
          aria-label="View photo full screen"
        >
          <img
            src={imageUrl(images[active]?.url)}
            alt={p.title}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
            className="size-full object-cover"
          />
        </button>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className={`${arrow} left-3`} aria-label="Previous photo">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} className={`${arrow} right-3`} aria-label="Next photo">
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
        {p.images.length > 0 && (
          <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
            <Expand className="size-3.5" />
            {active + 1} / {count}
          </span>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              className={`aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg ring-2 ring-inset sm:w-28 ${i === active ? "ring-brand-600" : "ring-transparent opacity-70 hover:opacity-100"}`}
              aria-label={`Show image ${i + 1}`}
            >
              <img src={imageUrl(img.url)} alt="" loading="lazy" onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)} className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-10"
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <img
            src={imageUrl(images[active]?.url)}
            alt={p.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="size-6" />
          </button>
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => (e.stopPropagation(), go(-1))}
                className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-6"
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={(e) => (e.stopPropagation(), go(1))}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-6"
                aria-label="Next photo"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/80 tabular-nums">
            {active + 1} / {count}
          </span>
        </div>
      )}
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Ruler; label: string; value?: string | number }) {
  if (value === undefined || value === "" || value === null) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
      <Icon className="size-5 text-brand-600" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function EnquiryCard({ p }: { p: Property }) {
  const send = useSendInquiry();
  const propertyUrl = typeof window === "undefined" ? "" : window.location.href;
  const waMessage = `Hello Acme Homes, I'm interested in "${p.title}" (${priceLabel(p)}, ${locationLabel(p)}). ${propertyUrl}`;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: `Hello, I'm interested in "${p.title}". Please share more details.`,
  });

  return (
    <aside className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 lg:sticky lg:top-28">
      <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-600">
          <ShieldCheck className="size-6 text-gold-300" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Acme Homes and Properties</p>
          <p className="text-xs text-gray-500">Speak to our team about this property</p>
        </div>
      </div>

      <div className="mb-5 grid gap-2">
        <a href={`tel:${CONTACT.phone}`} className={buttonClass("gold", "md", "w-full")}>
          <Phone className="size-4" /> Call {CONTACT.phone}
        </a>
        <WhatsAppLink message={waMessage} className="w-full" />
      </div>

      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <Mail className="size-4 text-brand-600" /> Send an enquiry
      </h3>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          send.mutate(
            { ...form, phone: form.phone || undefined, property: p._id, subject: `Enquiry: ${p.title}` },
            {
              onSuccess: (res) => {
                toast.success(res.message ?? "Enquiry sent");
                setForm((f) => ({ ...f, name: "", email: "", phone: "" }));
              },
              onError: (err) => toast.error(errorMessage(err)),
            },
          );
        }}
      >
        <Input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <Button type="submit" className="w-full" loading={send.isPending}>
          Send enquiry
        </Button>
      </form>
      <p className="mt-4 text-center text-xs text-gray-400">
        All viewings and offers are handled by Acme Homes.
      </p>
    </aside>
  );
}

export default function PropertyDetail() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useProperty(slug);

  if (isLoading) return <Spinner className="min-h-dvh pt-20" />;
  if (isError || !data)
    return (
      <div className="container-page pb-20 pt-36">
        <EmptyState
          title="Property not found"
          message="This listing may have been removed or is awaiting approval."
          action={
            <Link to="/buildings" className={buttonClass()}>
              Browse properties
            </Link>
          }
        />
      </div>
    );

  const { property: p, similar } = data;
  const isLand = p.category === "land";

  return (
    <div className="bg-gray-50/60 pb-20 pt-28">
      <div className="container-page">
        <Link to={isLand ? "/lands" : "/buildings"} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
          <ArrowLeft className="size-4" /> Back to {isLand ? "lands" : "buildings"}
        </Link>

        {p.status !== "approved" && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-gold-100 p-4 text-sm text-amber-900">
            <StatusBadge status={p.status} />
            {p.status === "pending"
              ? "This listing is awaiting admin approval and is only visible to you."
              : `Rejected: ${p.rejectionReason ?? "no reason given"}`}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Gallery p={p} />

            <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge tone="green">{isLand ? capitalize(p.landUse) || "Land" : LISTING_BADGE[p.listingType]}</Badge>
                  {p.buildingType && <Badge>{capitalize(p.buildingType)}</Badge>}
                  {p.isFeatured && <Badge tone="gold">Featured</Badge>}
                </div>
                <h1 className="text-3xl font-bold">{p.title}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-gray-500">
                  <MapPin className="size-4" /> {[p.location.address, locationLabel(p), p.location.state].filter(Boolean).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-brand-600">{priceLabel(p)}</p>
                <p className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-400">
                  <Eye className="size-3.5" /> {p.views} views
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {isLand ? (
                <>
                  <Fact icon={Ruler} label="Size" value={p.size ? `${p.size.toLocaleString()} sqm` : undefined} />
                  <Fact icon={LandPlot} label="Land use" value={capitalize(p.landUse)} />
                  <Fact icon={FileCheck2} label="Title document" value={p.titleDocument} />
                </>
              ) : (
                <>
                  <Fact icon={BedDouble} label="Bedrooms" value={p.bedrooms} />
                  <Fact icon={Bath} label="Bathrooms" value={p.bathrooms} />
                  <Fact icon={Ruler} label="Size" value={p.size ? `${p.size} sqm` : undefined} />
                  <Fact icon={Car} label="Parking" value={p.parking} />
                  <Fact icon={HomeIcon} label="Type" value={capitalize(p.buildingType)} />
                  <Fact icon={Sofa} label="Furnishing" value={p.furnished ? "Furnished" : "Unfurnished"} />
                </>
              )}
            </div>

            <section className="mt-10">
              <h2 className="mb-3 text-xl font-bold">Description</h2>
              <FormattedText text={p.description} />
            </section>

            {p.features.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 text-xl font-bold">Features</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle2 className="size-4 text-brand-500" /> {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div>
            <EnquiryCard p={p} />
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-6 text-2xl font-bold">Similar properties in {p.location.city}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((s) => (
                <PropertyCard key={s._id} p={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
