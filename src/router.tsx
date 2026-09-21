import { createBrowserRouter } from "react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RequireAuth } from "@/components/RequireAuth";

import Home from "@/pages/Home";
import Listings from "@/pages/Listings";
import PropertyDetail from "@/pages/PropertyDetail";
import Services from "@/pages/Services";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import Profile from "@/pages/dashboard/Profile";

// Dashboard pages are code-split so public visitors never download them.
const page = (loader: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await loader()).default,
});
const AgentOverview = page(() => import("@/pages/dashboard/AgentOverview"));
const ManageListings = page(() => import("@/pages/dashboard/ManageListings"));
const AdminListings = page(async () => {
  const m = await import("@/pages/dashboard/ManageListings");
  return { default: () => <m.default admin /> };
});
const ListingEditor = page(() => import("@/pages/dashboard/ListingEditor"));
const Inquiries = page(() => import("@/pages/dashboard/Inquiries"));
const AdminOverview = page(() => import("@/pages/admin/AdminOverview"));
const Users = page(() => import("@/pages/admin/Users"));

const sharedDashboardRoutes = [
  { path: "listings/new", lazy: ListingEditor },
  { path: "listings/:slug/edit", lazy: ListingEditor },
  { path: "inquiries", lazy: Inquiries },
  { path: "profile", element: <Profile /> },
];

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "buildings", element: <Listings key="building" category="building" /> },
      { path: "lands", element: <Listings key="land" category="land" /> },
      { path: "properties/:slug", element: <PropertyDetail /> },
      { path: "services", element: <Services /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      {
        element: <RequireAuth />,
        children: [{ path: "account", element: <Profile standalone /> }],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
  {
    // Agents / landlords (admins can use it too, to manage their own posts)
    path: "dashboard",
    element: <RequireAuth roles={["agent", "admin"]} />,
    children: [
      {
        element: <DashboardLayout variant="agent" />,
        children: [
          { index: true, lazy: AgentOverview },
          { path: "listings", lazy: ManageListings },
          ...sharedDashboardRoutes,
        ],
      },
    ],
  },
  {
    path: "admin",
    element: <RequireAuth roles={["admin"]} />,
    children: [
      {
        element: <DashboardLayout variant="admin" />,
        children: [
          { index: true, lazy: AdminOverview },
          { path: "listings", lazy: AdminListings },
          { path: "users", lazy: Users },
          ...sharedDashboardRoutes,
        ],
      },
    ],
  },
]);
