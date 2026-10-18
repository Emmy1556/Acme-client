import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Building2, Handshake, KeyRound, LandPlot, Search, ShieldCheck } from "lucide-react";
import { useProperties } from "@/hooks/queries";
import { CardSkeleton, PropertyCard } from "@/components/PropertyCard";
import { EmptyState, SectionHeading } from "@/components/ui/Feedback";
import { buttonClass } from "@/components/ui/Button";

const HERO_IMG =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=75";

function Hero() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"buildings" | "lands">("buildings");
  const [q, setQ] = useState("");
  const [listingType, setListingType] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (listingType && tab === "buildings") params.set("listingType", listingType);
    navigate(`/${tab}?${params}`);
  };

  return (
    <section className="relative isolate flex min-h-[640px] items-center overflow-hidden pt-20 lg:min-h-dvh">
      <img src={HERO_IMG} alt="" onError={(e) => (e.currentTarget.style.display = "none")} className="absolute inset-0 -z-20 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-brand-600/85" />
      <div className="container-page py-20">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">Acme Homes and Properties</p>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
          Find a home you love, or land to build your future on.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-brand-100">
          Verified houses and lands for sale, rent, lease and short-let across Lagos and beyond.
        </p>

        <form onSubmit={submit} className="mt-10 max-w-3xl rounded-xl bg-white p-2 shadow-2xl">
          <div className="flex gap-1 p-1">
            {(["buildings", "lands"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-4 py-2 text-sm font-semibold capitalize ${
                  tab === t ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 p-1 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-md border border-gray-200 px-3">
              <Search className="size-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by area, city or estate name…"
                className="h-11 w-full bg-transparent text-sm outline-none"
              />
            </label>
            {tab === "buildings" && (
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="h-11 rounded-md border border-gray-200 px-3 text-sm outline-none"
                aria-label="Listing type"
              >
                <option value="">Any type</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="lease">For Lease</option>
                <option value="shortlet">Short-Let</option>
              </select>
            )}
            <button className={buttonClass("primary", "lg", "h-11")}>Search</button>
          </div>
        </form>
      </div>
    </section>
  );
}

function FeaturedSection({ category }: { category: "building" | "land" }) {
  // Featured listings first, then the newest ones fill the remaining slots.
  const { data, isLoading } = useProperties({ category, sort: "featured", limit: 6 });
  const isLand = category === "land";

  return (
    <section className={isLand ? "bg-cream py-20" : "py-20"}>
      <div className="container-page">
        <SectionHeading
          title={isLand ? "Featured Land Properties" : "Featured House Properties"}
          subtitle={`Handpicked and newly listed ${isLand ? "lands" : "homes"} from Acme`}
          action={
            <Link to={isLand ? "/lands" : "/buildings"} className={buttonClass("outline", "md")}>
              View all properties <ArrowRight className="size-4" />
            </Link>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}
          {data?.items.map((p) => <PropertyCard key={p._id} p={p} />)}
        </div>
        {data && data.items.length === 0 && (
          <EmptyState title="No listings yet" message="Check back soon — new properties are added regularly." />
        )}
      </div>
    </section>
  );
}

const SERVICES = [
  { icon: Building2, title: "Property Sales", text: "Buy verified homes with clear titles and transparent pricing." },
  { icon: KeyRound, title: "Rentals & Short-lets", text: "Find the right space for a night, a year, or longer." },
  { icon: LandPlot, title: "Land Acquisition", text: "Residential, commercial and agricultural land with proper documentation." },
  { icon: Handshake, title: "Property Management", text: "We handle tenants, maintenance and rent collection for owners." },
];

function ServicesTeaser() {
  return (
    <section className="bg-brand-600 py-20">
      <div className="container-page">
        <SectionHeading light title="How we help" subtitle="Everything you need to own, grow and invest in real estate." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <Icon className="size-8 text-gold-300" />
              <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm text-brand-100">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentCta() {
  return (
    <section className="py-20">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-gold-100 p-6 sm:p-12 lg:flex-row lg:items-center">
          {/* Icon above the text on phones so the copy gets the full width. */}
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
            <ShieldCheck className="size-10 shrink-0 text-brand-600 sm:mt-1" />
            <div>
              <h2 className="text-2xl font-bold">Are you an agent or landlord?</h2>
              <p className="mt-2 max-w-xl text-gray-600">
                List your houses and land on Acme. Every listing is reviewed by our team before it goes live, so buyers
                can trust what they see.
              </p>
            </div>
          </div>
          <Link to="/register?as=agent" className={buttonClass("primary", "lg", "w-full shrink-0 sm:w-auto")}>
            List your property
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedSection category="building" />
      <FeaturedSection category="land" />
      <ServicesTeaser />
      <AgentCta />
    </>
  );
}
