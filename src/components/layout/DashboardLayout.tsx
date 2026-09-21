import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { clsx } from "clsx";
import {
  Building,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  PlusCircle,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/stores/auth";
import { useLogout } from "@/hooks/auth";

type Item = { to: string; label: string; icon: typeof Building; end?: boolean };

const AGENT_NAV: Item[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/listings", label: "My Listings", icon: Building, end: true },
  { to: "/dashboard/listings/new", label: "Add Listing", icon: PlusCircle },
  { to: "/dashboard/inquiries", label: "Enquiries", icon: Inbox },
  { to: "/dashboard/profile", label: "Profile", icon: UserCog },
];

const ADMIN_NAV: Item[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/listings", label: "All Listings", icon: ListChecks, end: true },
  { to: "/admin/listings/new", label: "Post Property", icon: PlusCircle },
  { to: "/admin/users", label: "Users & Agents", icon: Users },
  { to: "/admin/inquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/profile", label: "Profile", icon: UserCog },
];

/** "/admin" or "/dashboard", depending on where we are. */
export function useDashboardBase() {
  return useLocation().pathname.startsWith("/admin") ? "/admin" : "/dashboard";
}

export function DashboardLayout({ variant }: { variant: "agent" | "admin" }) {
  const user = useAuth((s) => s.user);
  const logout = useLogout();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const nav = variant === "admin" ? ADMIN_NAV : AGENT_NAV;

  useEffect(() => setOpen(false), [pathname]);

  const sidebar = (
    <div className="flex h-full flex-col bg-brand-600">
      <div className="flex h-20 items-center px-6">
        <Logo />
      </div>
      <p className="px-6 pb-2 text-[11px] font-bold uppercase tracking-widest text-brand-200">
        {variant === "admin" ? "Admin" : "Agent / Landlord"}
      </p>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-gold-300 text-brand-800" : "text-brand-100 hover:bg-white/10 hover:text-white",
              )
            }
          >
            <Icon className="size-4.5" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-brand-100 hover:bg-white/10 hover:text-white">
          <ExternalLink className="size-4.5" /> View website
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-brand-100 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4.5" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-8">
          <button className="rounded-md p-2 text-gray-600 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs capitalize text-gray-500">{user?.agency || user?.role}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-brand-600 font-bold text-gold-300">
              {user?.name.charAt(0)}
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
