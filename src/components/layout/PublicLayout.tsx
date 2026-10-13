import { Outlet, ScrollRestoration } from "react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "@/components/WhatsAppButton";

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <ScrollRestoration />
    </div>
  );
}

/** Green banner used at the top of inner pages (sits under the fixed navbar). */
export function PageHero({ title, subtitle, image }: { title: string; subtitle?: string; image?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-600 pt-20">
      {image && <img src={image} alt="" className="absolute inset-0 -z-10 size-full object-cover opacity-25" />}
      <div className="container-page py-16 sm:py-20">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-brand-100">{subtitle}</p>}
      </div>
    </section>
  );
}
