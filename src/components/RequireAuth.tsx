import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/stores/auth";
import type { Role } from "@/lib/types";
import { Spinner } from "./ui/Feedback";

/** Guards a route subtree by authentication and (optionally) role. */
export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <Spinner className="min-h-dvh" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
