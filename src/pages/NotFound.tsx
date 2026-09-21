import { Link } from "react-router";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-4 pt-20 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-500">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className={buttonClass("primary", "md", "mt-6")}>
        Back home
      </Link>
    </div>
  );
}
