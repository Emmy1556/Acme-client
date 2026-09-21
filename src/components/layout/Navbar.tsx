import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { clsx } from "clsx";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { dashboardPathFor, useAuth } from "@/stores/auth";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/buildings", label: "Buildings" },
  { to: "/lands", label: "Lands" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  const { pathname } = useLocation();
  const user = useAuth((s) => s.user);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Transparent over the hero on the home page; solid brand green everywhere else / once scrolled.
  const overlay = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "text-[13px] font-semibold uppercase tracking-wider transition-colors",
      isActive ? "text-gold-300" : "text-white/90 hover:text-gold-300",
    );

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        overlay ? "bg-transparent" : "bg-brand-600 shadow-lg shadow-brand-900/10",
      )}
    >
      <div className="container-page flex h-20 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <Link
              to={dashboardPathFor(user.role) === "/" ? "/account" : dashboardPathFor(user.role)}
              className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-white/90 hover:text-gold-300"
            >
              <LayoutDashboard className="size-4" />
              {user.role === "user" ? "Account" : "Dashboard"}
            </Link>
          ) : (
            <Link to="/login" className="text-[13px] font-semibold uppercase tracking-wider text-white/90 hover:text-gold-300">
              Sign in
            </Link>
          )}
          <Link
            to="/contact"
            className="rounded-md border border-white/80 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:border-gold-300 hover:bg-gold-300 hover:text-brand-800"
          >
            Contact Us
          </Link>
        </div>

        <button
          className="rounded-md p-2 text-white lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-brand-600 lg:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col gap-1 py-4">
            {[...LINKS, { to: "/contact", label: "Contact Us" }].map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} className={(s) => clsx(linkClass(s), "py-2.5")}>
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 border-t border-white/10 pt-3">
              {user ? (
                <Link to={user.role === "user" ? "/account" : dashboardPathFor(user.role)} className="text-sm font-semibold text-gold-300">
                  Go to {user.role === "user" ? "account" : "dashboard"} →
                </Link>
              ) : (
                <Link to="/login" className="text-sm font-semibold text-gold-300">
                  Sign in / Register →
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
