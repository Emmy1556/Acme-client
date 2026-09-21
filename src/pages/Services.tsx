import { Link } from "react-router";
import { Building2, ClipboardCheck, Hammer, Handshake, KeyRound, LandPlot } from "lucide-react";
import { PageHero } from "@/components/layout/PublicLayout";
import { buttonClass } from "@/components/ui/Button";

// TODO(before launch): confirm this list matches the services Acme actually offers.
const SERVICES = [
  { icon: Building2, title: "Property Sales", text: "We connect buyers with verified homes — apartments, terraces, duplexes and detached houses — with clear titles and fair pricing." },
  { icon: KeyRound, title: "Rentals, Leases & Short-lets", text: "Flexible options for individuals, families and businesses, from a single night to multi-year leases." },
  { icon: LandPlot, title: "Land Acquisition", text: "Residential, commercial and agricultural land, backed by C of O, Governor's Consent, registered surveys and more." },
  { icon: Handshake, title: "Property Management", text: "We find and vet tenants, collect rent and handle maintenance so owners earn without the stress." },
  { icon: ClipboardCheck, title: "Documentation & Due Diligence", text: "Title verification, survey checks and deed preparation, so every transaction is secure." },
  { icon: Hammer, title: "Construction & Renovation", text: "From foundation to finishing, our partners build and renovate to a high standard, on time and on budget." },
];

export default function Services() {
  return (
    <>
      <PageHero title="Our Services" subtitle="Everything you need to own, grow and invest in real estate — under one roof." />
      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition hover:shadow-lg">
              <div className="flex size-12 items-center justify-center rounded-lg bg-brand-600">
                <Icon className="size-6 text-gold-300" />
              </div>
              <h2 className="mt-5 text-xl font-bold">{title}</h2>
              <p className="mt-3 leading-relaxed text-gray-600">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600">Not sure where to start?</p>
          <Link to="/contact" className={buttonClass("primary", "lg", "mt-4")}>
            Talk to our team
          </Link>
        </div>
      </section>
    </>
  );
}
