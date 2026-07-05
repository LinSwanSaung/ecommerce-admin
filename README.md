# Ecommerce Admin Panel

An internal admin panel for store staff to monitor performance and manage
products, orders, and customers. Built with the Next.js App Router, TypeScript,
and a shadcn/ui component layer.

The data is mocked (served from Next.js API routes), but the frontend is wired
like it talks to a real backend: every list is fetched over HTTP, with real
loading / empty / error states, and all filtering, search, sorting, and
pagination happen server-side and are driven by the URL.

## Tech stack

| Tool | Why |
| --- | --- |
| **Next.js 16 (App Router) + TypeScript** | File-based routing; the URL is the source of truth for table state. |
| **Tailwind CSS + shadcn/ui** | Accessible components copied *into* the repo (built on Base UI primitives), so they're owned and editable, not a black box. |
| **TanStack Query** | Client-side fetching with `isLoading` / `isError` / caching and easy refetch-after-mutation. |
| **React Hook Form + Zod** | One schema validates the product form and types it. |
| **Mock Next.js API routes** | An in-memory dataset behind `/api/*` so the app behaves like a real system. |
| **next-themes + Sonner** | Dark mode and toast notifications. |
| **Recharts** | The dashboard revenue chart. |
| **Vitest** | Unit tests for the core query utility. |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000  (redirects to /dashboard)
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run test     # run unit tests (Vitest)
npm run lint     # ESLint
```

## Project structure

```
src/
  app/
    layout.tsx            # root layout: fonts, providers, admin shell
    page.tsx              # "/" -> redirects to /dashboard
    providers.tsx         # client context: React Query, theme, tooltips, toaster
    dashboard/            # page.tsx (server) + dashboard-view.tsx (client)
    products/             # page.tsx + products-view.tsx
    orders/               # page.tsx + orders-view.tsx
    customers/            # page.tsx + customers-view.tsx
    api/                  # mock backend: products (GET/POST), products/[id] (PATCH),
                          #               orders, customers, dashboard
  components/
    layout/               # sidebar, header, app-shell, theme-toggle, page-header
    tables/               # data-table, table-pagination, search-input,
                          #   filter-select, column-toggle
    products/             # product-form-dialog (add/edit)
    dashboard/            # sales-chart (revenue/orders metric chart)
    ui/                   # shadcn/ui primitives
    status-badge.tsx, stat-card.tsx, empty-state.tsx, detail-sheet.tsx
  hooks/
    use-query-params.ts   # read/write URL search params
    use-debounced-value.ts
    use-list.ts           # generic list fetcher (products/orders/customers)
    use-products.ts       # create / update / archive mutations
    use-dashboard.ts
  lib/
    query.ts              # the shared search/filter/sort/paginate engine
    constants.ts          # statuses, categories, badge colors, labels
    format.ts             # currency / number / date formatters
    product-schema.ts     # Zod schemas (form + API)
    utils.ts              # cn()
  data/
    mock-data.ts          # deterministic generated products / orders / customers
  types/
    index.ts              # domain models
```

The split is **route folders own their page** (`page.tsx` = server component with
metadata; `*-view.tsx` = the client component that fetches and renders), and
everything reusable lives under `components/`, `hooks/`, and `lib/`.

## State management

I deliberately used **three** kinds of state, each for what it's best at —
rather than reaching for one global store:

1. **URL search params = filter/search/sort/page state.** This is the primary
   decision. A filtered table view is *navigation state*: it should survive a
   refresh, be shareable, and work with the back button. So it lives in the URL
   (e.g. `/products?search=mug&status=active&sort=price&order=desc&page=2`).
   A small hook, [`useQueryParams`](src/hooks/use-query-params.ts), wraps Next's
   `useSearchParams` / `useRouter` so updating one param keeps the rest. The
   table, search box, filters, and pagination all read and write through it —
   there's no separate "filter state" to keep in sync.

2. **TanStack Query = server data.** Each list page calls
   [`useList`](src/hooks/use-list.ts), which mirrors the current URL params into
   the API request and keys the cache by them. Changing a filter changes the
   key, which triggers a refetch — and gives `isLoading` / `isError` for free.
   Product mutations invalidate the `products` queries so the table reflects
   changes immediately.

3. **Local `useState` = ephemeral UI.** Which row's detail drawer is open,
   whether the add/edit dialog is showing, which table columns are hidden, and
   the dashboard chart's metric tab. These are throwaway view preferences — they
   never need to be global, shared, or persisted, so they stay local to the view.

There's intentionally **no Zustand / Context store for app data** — the project
doesn't have cross-page shared state that would justify one. (Theme and the
query client *are* in context, because they genuinely are app-wide.)

## Data layer

All three list endpoints share one generic engine,
[`queryList`](src/lib/query.ts), which searches, filters, sorts, and paginates
any array of records. So each API route is only a few lines:

```ts
const query = parseListQuery(request.nextUrl.searchParams, {
  searchFields: ["name", "sku"],
  filterKeys: ["category", "status"],
  defaultSort: "createdAt",
  defaultOrder: "desc",
});
return NextResponse.json(queryList(products, query));
```

Product create/edit/archive mutate the in-memory array, so changes persist
across requests within a running server.

## Accessibility

- Dialogs and drawers are keyboard-accessible (focus trap, Esc to close) via the
  underlying primitives.
- Semantic `<table>` markup; sortable headers are real `<button>`s.
- All form fields have `<label>`s; invalid fields set `aria-invalid` and show a
  message. Selects use `aria-label`.
- Visible focus rings; the active nav link sets `aria-current="page"`.
- Empty/error states use `role="status"`.

## Assumptions & trade-offs

- **Mock backend is in-memory.** Restarting the server resets created/edited
  products. Fine for a demo; a real build would use a database.
- **Detail views reuse the already-fetched row** instead of a separate
  `GET /:id` request, since the list response already contains the full object —
  fewer round-trips, instant drawer.
- **"Immediate local update" via invalidate-and-refetch** rather than hand-rolled
  optimistic cache edits. With the instant mock API the table updates
  immediately, and it avoids the complexity of correctly inserting a row into a
  sorted/filtered/paginated page. The spec allows either.
- **Filter changes use `router.replace`** (not `push`) so typing in the search
  box doesn't stack dozens of history entries.
- **Mock data is generated from a fixed seed** so the dataset is stable across
  restarts (predictable screenshots and tests); only the dates are relative to
  "today" so the dashboard always looks current.
- **Archive instead of delete.** Products are archived (status change) rather
  than hard-deleted, which is the safer pattern for a catalog.
- **One product form for add and edit**, switching on whether a product was
  passed in — less duplication than two near-identical forms.
- **Column visibility is local state, not URL state.** Filters describe *what
  data* you're looking at (shareable), hidden columns are a personal view
  preference — so they deliberately don't pollute the URL.
- **Chart color contrast was validated, not eyeballed.** The theme's pale mint
  failed 3:1 contrast for a 2px line on the light surface, so the light-mode
  `--chart-1` token uses a darker emerald step of the same hue.

## Bonus features implemented

- Unit tests for the query engine and product validation schema (Vitest)
- GitHub Actions CI: lint, tests, and a production build on every push
- Product archive action (soft delete)
- Skeleton loading UI on all tables and stats
- Clean mobile navigation (slide-in drawer)
- Table column visibility controls (all three list pages)
- Chart metric toggle (Revenue / Orders) with themed hover tooltip + crosshair

## Screenshots

| | |
| --- | --- |
| Dashboard | ![Dashboard](docs/screenshots/dashboard.png) |
| Dashboard (dark) | ![Dashboard dark](docs/screenshots/dashboard-dark.png) |
| Products | ![Products](docs/screenshots/products.png) |
| Add product — validation | ![Form validation](docs/screenshots/product-form-validation.png) |
| Product detail drawer | ![Product detail](docs/screenshots/product-detail.png) |
| Order detail | ![Order detail](docs/screenshots/order-detail.png) |
| Customers | ![Customers](docs/screenshots/customers.png) |
| Mobile navigation | ![Mobile nav](docs/screenshots/mobile-nav.png) |
