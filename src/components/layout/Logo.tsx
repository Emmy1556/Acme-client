import { Link } from "react-router";
import { clsx } from "clsx";
import logoOnDark from "@/assets/ACMEG3.png";
import markGreen from "@/assets/ACMELogo1.png";

/**
 * `light` (default) = for dark/green backgrounds: the full gold-and-white ACMEG3 logo.
 * `light={false}` = for white backgrounds, where ACMEG3's white text would vanish:
 * the green "A" mark with the name set in text.
 */
export function Logo({ light = true, className }: { light?: boolean; className?: string }) {
  return (
    <Link to="/" className={clsx("flex shrink-0 items-center gap-2", className)} aria-label="Acme Homes and Properties — home">
      {light ? (
        <img src={logoOnDark} alt="Acme Homes and Properties Ltd." className="h-11 w-auto" />
      ) : (
        <>
          <img src={markGreen} alt="" className="h-10 w-auto" />
          <span className="leading-none">
            <span className="block text-xl font-extrabold tracking-tight text-brand-600">Acme</span>
            <span className="block text-[9px] font-medium tracking-wide text-gray-500">Homes and Properties Ltd.</span>
          </span>
        </>
      )}
    </Link>
  );
}
