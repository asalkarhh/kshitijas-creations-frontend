# Kshitija’s Creations Frontend

A warm, mobile-first catalogue and guest-ordering foundation for handmade jewellery, gifts, and keepsakes. The app intentionally has no customer login, payment gateway, OTP flow, or automated WhatsApp integration.

## Prerequisites

- Node.js 20.19+ (Node.js 22 LTS or newer is recommended)
- npm 10+
- The Kshitija’s Creations backend for live catalogue and order data (public integration begins in FE-02)

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

## Environment variables

| Variable              | Purpose                           | Example                                          |
| --------------------- | --------------------------------- | ------------------------------------------------ |
| `VITE_API_BASE_URL`   | Backend REST API root             | `http://localhost:8080/api/v1`                   |
| `VITE_MEDIA_BASE_URL` | Backend-hosted product media root | `http://localhost:8080/uploads`                  |
| `VITE_INSTAGRAM_URL`  | Public brand Instagram profile    | `https://www.instagram.com/kshitijas_creations/` |
| `VITE_SITE_URL`       | Canonical public site origin      | `http://localhost:5173`                          |

Configuration is read only through `src/app/config/env.ts`; backend and media URLs should not be hardcoded elsewhere.

## Commands

```bash
npm run dev          # local development
npm run lint         # ESLint
npm run test         # Vitest test suite
npm run build        # type-check and production build
npm run preview      # preview the production build
npm run format       # apply Prettier formatting
```

## Folder structure

```text
src/
  api/                 central Axios client and endpoint modules
  app/                 runtime configuration, query client, error boundary
  assets/              project-owned visual assets
  components/          common, layout, product, banner and cart UI
  features/            feature data and future feature-specific logic
  hooks/               reusable React hooks
  layouts/             public and admin route shells
  pages/               route-level page components
  routes/              lazy route tree and scroll restoration
  schemas/             Zod validation schemas
  services/            cross-feature service layer (reserved)
  store/               persistent cart state
  types/               API, catalogue and cart models
  utils/               formatting and media helpers
```

## Backend dependency and mock data

The centralized Axios client is ready for `/categories`, `/products`, `/banners`, `/orders`, `/auth`, and `/admin` endpoints. FE-01 uses typed mock catalogue data under each feature’s `data/` directory so it can be removed cleanly when public API integration lands in FE-02. Banner scheduling remains a backend responsibility.

## Current implementation status

- Public and admin placeholder routes, route-level lazy loading, 404 page, scroll restoration, and error boundary
- Responsive public shell with announcement bar, mobile drawer, desktop navigation, cart badge, Instagram links, and footer
- Homepage carousel, collection cards, featured/new product sections, brand story, Instagram promotion, and ordering steps
- Reusable product, loading, empty, error, modal, dialog, toast, pagination, and breadcrumb components
- Local-storage cart with availability guard, quantity cap of 20, totals, and no stored address data
- Checkout address validation foundation using React Hook Form and Zod; backend submission and prepared WhatsApp URL are deferred
- Centralized Axios API modules and normalized request errors with request IDs
- SEO defaults, per-page metadata, canonical placeholder, robots file, sitemap placeholder, focus states, semantic landmarks, and reduced-motion handling
- Admin CRUD, customer authentication, payments, and automatic WhatsApp functionality are intentionally not implemented

Before production, replace mock data, configure the production site URL, generate a complete sitemap, and add approved Privacy Policy and Terms content.
