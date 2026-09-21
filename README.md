# Acme Homes — Frontend (acme-frontend)

Web app for the Acme Homes and Properties platform: public site plus the agent/landlord and admin dashboards.
React 19 + TypeScript · Vite · Tailwind CSS v4 · React Router · TanStack Query · Zustand.

Backend lives in a separate repo: **acme-backend** (must be running for the app to work).

## Run locally

```bash
bun install
bun run dev        # http://localhost:5173
```

In development Vite proxies `/api` and `/uploads` to `http://localhost:5000`, so no `.env` is needed.

## Deploying

The API URL is decided at build time. Two options:

**A. Proxy through the frontend host (recommended).** Keeps the login cookie first-party, so sessions work in every browser including Safari.
Replace `YOUR-API-HOST` in `vercel.json` with your API's domain and leave `VITE_API_URL` empty. Backend: `COOKIE_SAMESITE=lax`.

**B. Call the API directly.** Set `VITE_API_URL=https://api.yourdomain.com` (no trailing slash).
Put the API on a subdomain of the same site (e.g. `acmehomes.com` + `api.acmehomes.com`) with `COOKIE_SAMESITE=lax`; on a different site you'd need `none`, which Safari blocks.
Remove the `/api` and `/uploads` rewrites from `vercel.json` in this case (keep the last one — it's the SPA fallback).

Either way the backend's `CLIENT_URL` must be this site's origin.

## Structure

```
src/
  components/   layout (Navbar, Footer, dashboards), cards, forms, ui primitives
  pages/        public pages, auth/, dashboard/ (agent + shared), admin/
  hooks/        TanStack Query hooks (queries.ts) and auth hooks
  lib/          axios client with silent token refresh, types, formatting, constants
  stores/       auth store (access token kept in memory only)
  router.tsx    routes; dashboard pages are lazy-loaded
```

Brand tokens (green `#014433`, gold `#F8D794`, cream, Onest font) are in `src/index.css`.
