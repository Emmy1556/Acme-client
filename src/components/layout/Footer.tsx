import { Link } from "react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { CONTACT } from "@/lib/constants";

const QUICK_LINKS = [
  { to: "/", label: "Home" },
  { to: "/buildings", label: "Buildings" },
  { to: "/lands", label: "Lands" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact Us" },
];

export function Footer() {
  return (
    <footer className="bg-brand-600 text-white">
      {/* Tablet: logo full width on top, links + contact side by side (room for the email). */}
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-brand-100">Helping You Own, Grow, and Invest Better.</p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gold-300">Quick Links</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-brand-100 uppercase tracking-wide hover:text-gold-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gold-300">Contact</h3>
          <ul className="space-y-3 text-sm text-brand-100">
            <li>
              <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-3 hover:text-gold-300">
                <Phone className="size-4 text-gold-300" /> {CONTACT.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 hover:text-gold-300">
                <Mail className="size-4 shrink-0 text-gold-300" />
                <span className="min-w-0 [overflow-wrap:anywhere]">{CONTACT.email}</span>
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="size-4 text-gold-300" /> {CONTACT.address}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs tracking-wide text-brand-200">
        © {new Date().getFullYear()} ACME HOMES AND PROPERTIES. All rights reserved.
      </div>
    </footer>
  );
}
