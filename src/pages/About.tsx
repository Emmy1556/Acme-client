import { Award, Eye, Target, Users } from "lucide-react";
import { PageHero } from "@/components/layout/PublicLayout";

// TODO(before launch): replace with the company's real figures — these are placeholders.
const STATS = [
  { value: "500+", label: "Properties listed" },
  { value: "1,200+", label: "Happy clients" },
  { value: "10+", label: "Years of experience" },
  { value: "15", label: "Cities covered" },
];

const VALUES = [
  { icon: Award, title: "Integrity", text: "Every listing is reviewed and every document checked before it reaches you." },
  { icon: Users, title: "Client-first", text: "We listen first, then find the property that fits your life and budget." },
  { icon: Target, title: "Excellence", text: "From first viewing to handing over keys, we sweat the details." },
];

export default function About() {
  return (
    <>
      <PageHero title="About Acme" subtitle="Helping you own, grow, and invest better." />

      <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-2">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=70"
          alt="A modern home listed by Acme"
          className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl"
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Who we are</p>
          <h2 className="mt-3 text-3xl font-bold">A trusted name in Nigerian real estate</h2>
          <p className="mt-5 leading-relaxed text-gray-600">
            Acme Homes and Properties Ltd. helps individuals, families and investors buy, rent and sell homes and land
            with confidence. We work with vetted agents and landlords, verify documentation, and stay with our clients
            long after the deal is done.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-brand-50 p-5">
              <Target className="size-6 text-brand-600" />
              <h3 className="mt-3 font-bold">Our mission</h3>
              <p className="mt-1 text-sm text-gray-600">Make property ownership simple, transparent and accessible.</p>
            </div>
            <div className="rounded-xl bg-gold-100 p-5">
              <Eye className="size-6 text-brand-600" />
              <h3 className="mt-3 font-bold">Our vision</h3>
              <p className="mt-1 text-sm text-gray-600">To be Africa's most trusted real estate partner.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-600 py-16">
        <div className="container-page grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-gold-300">{s.value}</p>
              <p className="mt-2 text-sm text-brand-100">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20">
        <h2 className="text-center text-3xl font-bold">What we stand for</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl p-6 text-center ring-1 ring-gray-200">
              <Icon className="mx-auto size-8 text-brand-600" />
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
