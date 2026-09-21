import { Link } from "react-router";
import { clsx } from "clsx";

export function Logo({ light = true, className }: { light?: boolean; className?: string }) {
  return (
    <Link to="/" className={clsx("flex items-center gap-2", className)} aria-label="Acme Homes and Properties — home">
      <svg viewBox="0 0 32 32" className="size-9 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="7" fill={light ? "#F8D794" : "#014433"} />
        <path d="M16 6 5 15h3v10h6v-6h4v6h6V15h3z" fill={light ? "#014433" : "#F8D794"} />
      </svg>
      <span className="leading-none">
        <span className={clsx("block text-xl font-extrabold tracking-tight", light ? "text-gold-300" : "text-brand-600")}>Acme</span>
        <span className={clsx("block text-[9px] font-medium tracking-wide", light ? "text-gold-200/80" : "text-gray-500")}>
          Homes and Properties Ltd.
        </span>
      </span>
    </Link>
  );
}
