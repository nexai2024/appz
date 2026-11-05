# SaaS Marketing OS - Component Architecture & System Design

This document maps out the Next.js `app/` directory structure, layout files, error boundaries, and nested routing strategies for the SaaS Marketing OS platform. The framework is Next.js 16 (App Router), leveraging React 19, TypeScript, Tailwind CSS 4, Shadcn UI, and Convex for state and data fetching.

## `app/` Directory Structure

```plaintext
app/
├── (public)/                 # Marketing site (unauthenticated/public view)
│   ├── about/
│   ├── blog/
│   │   ├── [slug]/
│   │   └── page.tsx
│   ├── changelog/
│   ├── contact/
│   ├── features/
│   ├── pricing/
│   ├── layout.tsx            # Public site layout (navbar, footer, theme provider)
│   ├── error.tsx             # Public boundary for rendering errors gracefully
│   ├── not-found.tsx
│   └── page.tsx              # Landing page
│
├── dashboard/                # Authenticated Dashboard
│   ├── admin/                # Admin gated routes
│   │   ├── admin-panel/
│   │   ├── analytics/
│   │   ├── apps/             # App & Infrastructure Command Center
│   │   │   ├── [id]/
│   │   │   │   ├── backups/
│   │   │   │   ├── domains/
│   │   │   │   ├── maintenance/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── tasks/            # Project & Task Engine
│   │   │   ├── page.tsx      # Kanban / Data Table view
│   │   │   └── notes/
│   │   ├── workflows/        # Automation & Workflow Builder
│   │   │   ├── [id]/         # Visual builder and execution logs side-sheet
│   │   │   └── page.tsx
│   │   ├── marketing/        # Growth & Marketing Studio
│   │   │   ├── campaigns/
│   │   │   ├── content/
│   │   │   ├── experiments/
│   │   │   └── waitlists/
│   │   ├── sales/            # Revenue & Affiliate Ledgers
│   │   │   ├── affiliates/
│   │   │   ├── plans/
│   │   │   └── page.tsx
│   │   ├── tickets/          # Support & Incident Ops
│   │   │   ├── incidents/
│   │   │   └── page.tsx      # Inbox view with active ticket side-sheet
│   │   ├── settings/
│   │   ├── layout.tsx        # Dashboard layout (sidebar, topbar nav, AdminGate)
│   │   ├── error.tsx         # Dashboard specific error boundary
│   │   ├── loading.tsx       # Skeleton loaders for dashboard transitions
│   │   └── page.tsx
│   ├── layout.tsx            # Root dashboard layout (StoreProvider, Suspense)
│   └── error.tsx             # Root dashboard error boundary
│
├── login/                    # Authentication
│   └── page.tsx
│
├── setup/                    # System setup health page
│   └── page.tsx
│
├── api/                      # Next.js API Routes (Serverless Functions)
│   └── unsplash/             # Unsplash proxy
│
├── globals.css               # Global Tailwind CSS and Custom Styles
├── layout.tsx                # Root layout (ThemeProviders, ConvexProvider)
└── not-found.tsx             # Global 404
```

## Routing & Layout Strategies

### 1. Root Layout (`app/layout.tsx`)
The root layout is responsible for injecting global styles, typography, and wrapping the application in core providers like the Theme Provider and Convex Client Provider.

### 2. Dashboard Layout (`app/dashboard/layout.tsx` & `app/dashboard/admin/layout.tsx`)
The dashboard implements a nested layout pattern:
- **`app/dashboard/layout.tsx`**: Provides global state via `StoreProvider` and wraps content in `Suspense`. It also injects the `AdminGate` component to protect all dashboard routes.
- **`app/dashboard/admin/layout.tsx`**: Implements the `DashboardShellClient`, providing the primary sidebar navigation, top app bar, search palette (Cmd+K), and user profile dropdown.

### 3. Module Routing (Data Grids & Modals)
To keep users in the context of their data grids without constantly navigating to new pages, the architecture uses a combination of route state and URL query parameters for Modals and Side Sheets.
- **Example (`app/dashboard/admin/tickets`)**: The main page renders the Ticket List. Clicking a ticket doesn't navigate to a new route entirely. Instead, it might update the query parameter (e.g., `?ticketId=123`) which triggers a slide-out side sheet component on the same page, preserving the list state and scroll position.

### 4. Error Boundaries (`error.tsx`)
Error boundaries are placed strategically to catch runtime errors:
- **Global**: `app/error.tsx` (catches anything fatal).
- **Public Area**: `app/(public)/error.tsx` (catches marketing site errors).
- **Dashboard**: `app/dashboard/error.tsx` (catches errors within the authenticated app, displaying a contextual error card instead of crashing the shell).

### 5. Loading UI (`loading.tsx`)
- Instead of generic spinners, module-specific `loading.tsx` files implement **Skeleton Loaders**.
- The Base Data Table component and Kanban Boards will utilize animated skeleton placeholders during Convex data fetching. Optimistic UI updates will be handled by Convex mutations on the client side.

## State Management & Data Fetching
- **Global UI State**: Managed via Zustand/React Context (`StoreProvider` in `features/_app/store.ts`), holding state like the currently active `app_id` or sidebar toggles.
- **Server State**: Managed by Convex React hooks (`useQuery`, `useMutation`), providing real-time reactivity, caching, and optimistic updates.
- **Form State**: Managed via `react-hook-form` paired with `zod` schema validation for data integrity across all CRUD operations.
