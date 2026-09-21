import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bath,
  BadgeCheck,
  BedDouble,
  Car,
  CheckCircle2,
  Eye,
  FileCheck2,
  Home as HomeIcon,
  LandPlot,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Sofa,
} from "lucide-react";
import { useProperty, useSendInquiry } from "@/hooks/queries";
import { errorMessage } from "@/lib/api";
import { FALLBACK_IMAGE, LISTING_BADGE, capitalize, imageUrl, locationLabel, priceLabel } from "@/lib/format";
import type { Property, PropertyOwner } from "@/lib/types";
import { Badge, EmptyState, Spinner, StatusBadge } from "@/components/ui/Feedback";
import { Button, buttonClass } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { PropertyCard } from "@/components/PropertyCard";

function Gallery({ p }: { p: Property }) {
  const [active, setActive] = useState(0);
  const images = p.images.length ? p.images : [{ url: "" }];
  return (
    <div>
      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-brand-50">
        <img
          src={imageUrl(images[active]?.url)}
          alt={p.title}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
          className="size-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              className={`aspect-[4/3] overflow-hidden rounded-lg ring-2 ${i === active ? "ring-brand-600" : "ring-transparent opacity-70 hover:opacity-100"}`}
              aria-label={`Show image ${i + 1}`}
            >
              <img src={imageUrl(img.url)} alt="" onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)} className="size-full object-cover" />
            </button>
          ))}
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
  const owner = typeof p.owner === "object" ? (p.owner as PropertyOwner) : undefined;
  const send = useSendInquiry();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: `Hello, I'm interested in "${p.title}". Please share more details.`,
  });

  return (
    <aside className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 lg:sticky lg:top-28">
      {owner && (
        <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-5">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-gold-300">
            {owner.name.charAt(0)}
          </div>
          <div>
            <p className="flex items-center gap-1 font-semibold text-gray-900">
              {owner.agency || owner.name}
              {owner.isVerified && <BadgeCheck className="size-4 text-brand-500" aria-label="Verified" />}
            </p>
            <p className="text-xs text-gray-500">Listed by {owner.name}</p>
          </div>
        </div>
      )}
      {owner?.phone && (
        <a href={`tel:${owner.phone}`} className={buttonClass("gold", "md", "mb-5 w-full")}>
          <Phone className="size-4" /> Call {owner.phone}
        </a>
      )}

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
              <p className="whitespace-pre-line leading-relaxed text-gray-600">{p.description}</p>
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
