import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Car,
  CalendarClock,
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
import {
  FALLBACK_IMAGE,
  LISTING_BADGE,
  SOLD_LABEL,
  capitalize,
  formatPrice,
  hasPriceRange,
  imageUrl,
  locationLabel,
  openPlots,
  priceLabel,
  sizeLabel,
  sqm,
} from "@/lib/format";
import type { Plot, Property } from "@/lib/types";
import { Badge, EmptyState, Spinner, StatusBadge } from "@/components/ui/Feedback";
import { Button, buttonClass } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { PropertyCard, SoldRibbon } from "@/components/PropertyCard";
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
      <div className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-brand-50 sm:aspect-[16/10]">
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
            className="size-full object-cover object-right-bottom"
          />
        </button>
        {p.isSold && <SoldRibbon large label={SOLD_LABEL[p.listingType]} />}
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

const plotText = (x: Plot) => `${sqm(x.size)} plot (${formatPrice(x.price)})`;

function EnquiryCard({ p, plotId, onPlotChange }: { p: Property; plotId: string; onPlotChange: (id: string) => void }) {
  const send = useSendInquiry();
  const plots = openPlots(p);
  const plot = plots.find((x) => x._id === plotId);
  const propertyUrl = typeof window === "undefined" ? "" : window.location.href;
  const waMessage = plot
    ? `Hello Acme Homes, I'm interested in the ${plotText(plot)} at "${p.title}", ${locationLabel(p)}. ${propertyUrl}`
    : `Hello Acme Homes, I'm interested in "${p.title}" (${priceLabel(p)}, ${locationLabel(p)}). ${propertyUrl}`;
  const defaultMessage = plot
    ? `Hello, I'm interested in the ${plotText(plot)} at "${p.title}". Please share more details.`
    : `Hello, I'm interested in "${p.title}". Please share more details.`;
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: defaultMessage });
  // Follow the chosen plot size in the message until the visitor types their own.
  const [messageEdited, setMessageEdited] = useState(false);
  useEffect(() => {
    if (!messageEdited) setForm((f) => ({ ...f, message: defaultMessage }));
  }, [defaultMessage, messageEdited]);

  return (
    <aside id="enquiry" className="scroll-mt-28 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 lg:sticky lg:top-28">
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
            {
              ...form,
              phone: form.phone || undefined,
              property: p._id,
              plotId: plot?._id,
              subject: plot ? `Enquiry: ${p.title} — ${sqm(plot.size)}` : `Enquiry: ${p.title}`,
            },
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
        {plots.length > 1 && (
          <Select aria-label="Plot size" value={plotId} onChange={(e) => onPlotChange(e.target.value)}>
            <option value="">Plot size: not sure yet</option>
            {plots.map((x) => (
              <option key={x._id} value={x._id}>
                {sqm(x.size)} — {formatPrice(x.price)}
              </option>
            ))}
          </Select>
        )}
        <Input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Textarea
          required
          value={form.message}
          onChange={(e) => {
            setMessageEdited(true);
            setForm({ ...form, message: e.target.value });
          }}
        />
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

/** "Available plot sizes" table for land with several sizes (or payment plans). */
function PlotTable({ p, onEnquire }: { p: Property; onEnquire: (id: string) => void }) {
  const plots = p.plots ?? [];
  const showPlans = plots.some((x) => x.paymentPlan);
  return (
    <section className="mt-10">
      <h2 className="mb-1 text-xl font-bold">Available plot sizes</h2>
      <p className="mb-4 text-sm text-gray-500">Pick the size that suits you — our team will take it from there.</p>
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
        <ul className="divide-y divide-gray-100">
          {plots.map((x) => (
            <li
              key={x._id ?? x.size}
              className={`flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3.5 sm:px-5 ${x.isSoldOut ? "bg-gray-50" : ""}`}
            >
              <div className="min-w-24">
                <p className={`text-base font-bold ${x.isSoldOut ? "text-gray-400 line-through" : "text-gray-900"}`}>{sqm(x.size)}</p>
              </div>
              <div className="min-w-32">
                <p className={`text-base font-extrabold ${x.isSoldOut ? "text-gray-400 line-through" : "text-brand-600"}`}>
                  {formatPrice(x.price, p.currency)}
                </p>
              </div>
              {showPlans && (
                <p className="min-w-0 flex-1 basis-48 text-sm text-gray-600">
                  {x.paymentPlan ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock className="size-4 shrink-0 text-brand-500" /> {x.paymentPlan}
                    </span>
                  ) : (
                    <span className="text-gray-400">Outright payment</span>
                  )}
                </p>
              )}
              <div className="ml-auto flex items-center gap-2">
                {x.isSoldOut ? (
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold tracking-wide text-red-600 uppercase ring-1 ring-red-200">
                    Sold out
                  </span>
                ) : (
                  <>
                    <WhatsAppLink
                      label="WhatsApp"
                      className="h-8 px-3 text-xs"
                      message={`Hello Acme Homes, I'm interested in the ${plotText(x)} at "${p.title}", ${locationLabel(p)}. ${typeof window === "undefined" ? "" : window.location.href}`}
                    />
                    <button
                      type="button"
                      onClick={() => x._id && onEnquire(x._id)}
                      className={buttonClass("outline", "sm", "h-8 text-xs")}
                    >
                      Enquire
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Phones/tablets: the enquiry card sits far below the photos and details, so keep
 * Call / WhatsApp / Enquire pinned to the bottom of the screen.
 */
function MobileContactBar({ p }: { p: Property }) {
  const url = typeof window === "undefined" ? "" : window.location.href;
  const bar =
    "fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden";
  if (p.isSold) {
    return (
      <div className={bar}>
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <p className="min-w-0 flex-1 text-sm font-semibold text-red-600">This property has been {SOLD_LABEL[p.listingType].toLowerCase()}</p>
          <Link to={p.category === "land" ? "/lands" : "/buildings"} className={buttonClass("primary", "md", "shrink-0")}>
            See similar
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className={bar}>
      <div className="mx-auto grid max-w-xl grid-cols-3 gap-2">
        <a href={`tel:${CONTACT.phone}`} className={buttonClass("gold", "md", "px-2")}>
          <Phone className="size-4" /> Call
        </a>
        <WhatsAppLink
          label="WhatsApp"
          className="px-2"
          message={`Hello Acme Homes, I'm interested in "${p.title}" (${priceLabel(p)}, ${locationLabel(p)}). ${url}`}
        />
        <button
          type="button"
          className={buttonClass("primary", "md", "px-2")}
          onClick={() => document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          <Mail className="size-4" /> Enquire
        </button>
      </div>
    </div>
  );
}

/** Replaces the enquiry form once a property is sold: no enquiries, but a route to similar ones. */
function SoldCard({ p }: { p: Property }) {
  const label = SOLD_LABEL[p.listingType].toLowerCase();
  const browse = p.category === "land" ? "/lands" : "/buildings";
  return (
    <aside className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 lg:sticky lg:top-28">
      <div className="bg-red-600 px-6 py-4 text-white">
        <p className="text-xs font-semibold tracking-widest uppercase opacity-90">Deal closed</p>
        <p className="mt-1 text-xl font-extrabold">This property has been {label}</p>
      </div>
      <div className="space-y-4 p-6">
        <p className="text-sm text-gray-600">
          Acme Homes closed this deal{p.soldAt ? ` in ${new Date(p.soldAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}` : ""}.
          Looking for something similar? Our team can help you find it.
        </p>
        <Link to={browse} className={buttonClass("primary", "md", "w-full")}>
          Browse available {p.category === "land" ? "lands" : "properties"}
        </Link>
        <WhatsAppLink
          className="w-full"
          label="Ask about similar properties"
          message={`Hello Acme Homes, I saw "${p.title}" in ${locationLabel(p)} has been ${label}. Do you have anything similar?`}
        />
      </div>
    </aside>
  );
}

export default function PropertyDetail() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useProperty(slug);
  const [plotId, setPlotId] = useState("");

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

        {/* min-w-0: grid columns default to their content's width, so the scrollable
            thumbnail strip would otherwise stretch the page wider than the phone. */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <Gallery p={p} />

            <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge tone="green">{isLand ? capitalize(p.landUse) || "Land" : LISTING_BADGE[p.listingType]}</Badge>
                  {p.buildingType && <Badge>{capitalize(p.buildingType)}</Badge>}
                  {p.isFeatured && !p.isSold && <Badge tone="gold">Featured</Badge>}
                  {p.isSold && <Badge tone="red">{SOLD_LABEL[p.listingType]}</Badge>}
                </div>
                <h1 className="text-2xl leading-tight font-bold sm:text-3xl">{p.title}</h1>
                <p className="mt-2 flex items-start gap-1.5 text-gray-500">
                  <MapPin className="mt-1 size-4 shrink-0" /> {[p.location.address, locationLabel(p), p.location.state].filter(Boolean).join(", ")}
                </p>
              </div>
              <div className="sm:text-right">
                {p.isSold ? (
                  <p className="text-2xl font-extrabold text-red-600 sm:text-3xl">{SOLD_LABEL[p.listingType]}</p>
                ) : (
                  <p className="text-2xl font-extrabold text-brand-600 sm:text-3xl">
                    {hasPriceRange(p) && <span className="mr-1.5 text-base font-semibold text-gray-500">From</span>}
                    {priceLabel(p)}
                  </p>
                )}
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400 sm:justify-end">
                  <Eye className="size-3.5" /> {p.views} views
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {isLand ? (
                <>
                  <Fact icon={Ruler} label={p.maxSize ? "Plot sizes" : "Size"} value={sizeLabel(p)} />
                  <Fact icon={LandPlot} label="Land use" value={capitalize(p.landUse)} />
                  <Fact
                    icon={FileCheck2}
                    label={p.titleDocuments && p.titleDocuments.length > 1 ? "Title documents" : "Title document"}
                    value={p.titleDocuments?.join(", ")}
                  />
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

            {isLand && !p.isSold && p.plots && (p.plots.length > 1 || p.plots.some((x) => x.paymentPlan)) && (
              <PlotTable
                p={p}
                onEnquire={(id) => {
                  setPlotId(id);
                  document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            )}

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

          <div className="min-w-0">
            {p.isSold ? <SoldCard p={p} /> : <EnquiryCard p={p} plotId={plotId} onPlotChange={setPlotId} />}
          </div>
        </div>

        <MobileContactBar p={p} />

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
