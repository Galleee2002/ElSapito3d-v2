# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev           # Start Vite dev server with HMR

# Production
npm run build         # Type-check (tsc) then bundle (vite build)
npm run preview       # Preview production build locally

# Supabase Edge Functions
npm run supabase:deploy:approve-payment
npm run supabase:deploy:delete-payment
npm run supabase:deploy:create-payment-preference
npm run supabase:deploy:create-transfer-payment
npm run supabase:deploy:manage-admin-users
npm run supabase:deploy:all   # Deploy all edge functions
```

No test runner is configured. Environment variables required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Architecture

**ElSapito3d-v2** is an e-commerce platform for 3D-printed products. The stack is React 19 + TypeScript, Vite, Tailwind CSS v4, Supabase (PostgreSQL + Auth + Edge Functions + Storage), TanStack Query for server state, and Framer Motion for animations.

### Provider Stack (main.tsx → App.tsx)

```
QueryClientProvider → AuthProvider → CartProvider → ToastProvider → AuthModalProvider → ColorStoreProvider → BrowserRouter
```

All pages are lazy-loaded via `React.lazy` and wrapped in `<Suspense>`.

### Data Flow

```
Component → Custom Hook → Service → Supabase Client → PostgreSQL / Edge Functions / Storage
```

Services (`src/services/`) are plain objects exporting async methods. Hooks (`src/hooks/`) wrap services, add React Query caching, or manage Context state. Business logic must not live in components.

### Key Modules

- **`src/services/`** — One file per domain: `products.service.ts`, `payments.service.ts`, `categories.service.ts`, `colors.service.ts`, `storage.service.ts`, `mercado-pago.service.ts`. All typed; errors handled centrally.
- **`src/features/payments/`** — Self-contained payment subsystem with its own components, hooks, types (Zod schemas), and utils.
- **`src/types/`** — Shared TypeScript interfaces exported from here.
- **`src/constants/`** — App-wide constants (colors, motion variants, payment statuses, contact info).
- **`src/utils/`** — Pure utility functions (color helpers, date formatting, payment calculations, validators).

### Routing

Routes are defined in `App.tsx`. Protected routes use the `ProtectedRoute` template which checks Supabase auth + admin role. Main routes: `/`, `/productos`, `/carrito`, `/contacto`, `/payment/:status`, `/admin`.

### Payment Flow

Supports Mercado Pago (via Edge Function `create-payment-preference`), bank transfer (with proof file upload to Supabase Storage), and card. Payment records live in Supabase; approval/deletion go through Edge Functions. Realtime subscriptions keep the admin panel live.

## Component Conventions (Atomic Design)

Hierarchy: `atoms → molecules → organisms → templates → pages`

Each component lives in its own folder with an `index.ts` re-export:

```
src/components/atoms/Button/
├── Button.tsx   ← named export: export const Button = ...
└── index.ts     ← export { default } from "./Button"  (or named)
```

Pages use a direct default export without a wrapping folder.

**Import order within files:**
1. React + external libs
2. Components (atoms → molecules → organisms → templates)
3. Hooks → Services → Utils → Types → Constants → Assets → Styles

**Path alias:** `@` maps to `./src` (configured in `vite.config.ts` and `tsconfig.json`).

## Code Rules (from .cursorrules)

- No `any` in TypeScript — strict mode is enforced.
- Max 200 lines per component (ideally < 150); split if larger.
- No inline `style` prop — use Tailwind classes only.
- Tailwind customization goes in `@theme` block inside `src/styles/global.css`.
- Custom hooks must prefix with `use` and return objects (not arrays) for multiple values.
- Props drilling max 2 levels; use Context beyond that.
- Git commits in Spanish.
- No `console.log` in production code.
- `useEffect` cleanups are mandatory when subscribing to external sources.
- Always include `key` prop on list items.
