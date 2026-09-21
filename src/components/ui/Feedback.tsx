import { cn as clsx } from "@/lib/cn";
import { ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx("flex items-center justify-center py-16", className)}>
      <Loader2 className="size-7 animate-spin text-brand-600" />
    </div>
  );
}

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center">
      <Inbox className="mb-3 size-10 text-gray-300" />
      <h3 className="text-base font-semibold">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const badgeTones = {
  green: "bg-brand-50 text-brand-700 ring-brand-200",
  gold: "bg-gold-100 text-amber-800 ring-gold-300",
  gray: "bg-gray-100 text-gray-700 ring-gray-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
};

export function Badge({ tone = "gray", children, className }: { tone?: keyof typeof badgeTones; children: ReactNode; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const tone = status === "approved" ? "green" : status === "pending" ? "gold" : "red";
  return <Badge tone={tone}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );
  const btn = "inline-flex size-9 items-center justify-center rounded-md text-sm font-medium transition-colors";
  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      <button className={clsx(btn, "hover:bg-gray-100 disabled:opacity-40")} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft className="size-4" />
      </button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1">
          {i > 0 && n - nums[i - 1]! > 1 && <span className="px-1 text-gray-400">…</span>}
          <button
            className={clsx(btn, n === page ? "bg-brand-600 text-white" : "hover:bg-gray-100")}
            onClick={() => onChange(n)}
            aria-current={n === page ? "page" : undefined}
          >
            {n}
          </button>
        </span>
      ))}
      <button className={clsx(btn, "hover:bg-gray-100 disabled:opacity-40")} disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

export function SectionHeading({ title, subtitle, action, light }: { title: string; subtitle?: string; action?: ReactNode; light?: boolean }) {
  return (
    <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h2 className={clsx("text-2xl font-bold sm:text-3xl", light && "text-white")}>{title}</h2>
        {subtitle && <p className={clsx("mt-2", light ? "text-brand-100" : "text-gray-500")}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
