# Graph Report - supportingwebandapis/transport-bookings  (2026-07-11)

## Corpus Check
- 73 files · ~129,280 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 377 nodes · 1018 edges · 17 communities (14 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `82166e63`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- utils.ts
- trips.ts
- ok
- store.ts
- dependencies
- auth.ts
- route.ts
- compilerOptions
- page.tsx
- SokaSafari Travel — Web (Flights & Buses)
- SokaSafari monorepo integration
- proxy.ts
- next.config.ts
- eslint.config.mjs
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `ok()` - 36 edges
2. `fail()` - 25 edges
3. `isAdminAuthed()` - 25 edges
4. `cn()` - 23 edges
5. `parseBody()` - 18 edges
6. `Button()` - 16 edges
7. `compilerOptions` - 16 edges
8. `Card()` - 15 edges
9. `Spinner()` - 15 edges
10. `useCurrency()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `AdminDashboard()` --indirect_call--> `Ticket()`  [INFERRED]
  supportingwebandapis/transport-bookings/app/admin/page.tsx → supportingwebandapis/transport-bookings/components/Ticket.tsx
- `AdminLayout()` --calls--> `isAdminAuthed()`  [EXTRACTED]
  supportingwebandapis/transport-bookings/app/admin/layout.tsx → supportingwebandapis/transport-bookings/lib/auth.ts
- `AdminLogin()` --calls--> `isAdminAuthed()`  [EXTRACTED]
  supportingwebandapis/transport-bookings/app/admin/login/page.tsx → supportingwebandapis/transport-bookings/lib/auth.ts
- `AdminDashboard()` --calls--> `listLocations()`  [EXTRACTED]
  supportingwebandapis/transport-bookings/app/admin/page.tsx → supportingwebandapis/transport-bookings/lib/data/catalog.ts
- `AdminDashboard()` --calls--> `listOperators()`  [EXTRACTED]
  supportingwebandapis/transport-bookings/app/admin/page.tsx → supportingwebandapis/transport-bookings/lib/data/catalog.ts

## Import Cycles
- None detected.

## Communities (17 total, 3 thin omitted)

### Community 0 - "utils.ts"
Cohesion: 0.07
Nodes (53): AdminBookings(), fetchBookings(), blank, blank, AdminRouteRow, BookFlow(), empty, PassengerForm (+45 more)

### Community 1 - "trips.ts"
Cohesion: 0.08
Nodes (45): GET(), LandingPage(), CatalogResponse, AIRCRAFT, BUS_AMENITIES, COACHES, DEFAULT_ROUTES, FLIGHT_AMENITIES (+37 more)

### Community 2 - "ok"
Cohesion: 0.14
Nodes (33): PATCH(), DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), GET() (+25 more)

### Community 3 - "store.ts"
Cohesion: 0.12
Nodes (31): ConfirmationPage(), CreateBookingInput, createBooking(), CreateBookingInput, getBooking(), listBookings(), payBooking(), updateBookingStatus() (+23 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (34): dependencies, clsx, date-fns, framer-motion, @hookform/resolvers, lucide-react, next, @radix-ui/react-slot (+26 more)

### Community 5 - "auth.ts"
Cohesion: 0.11
Nodes (24): ADMIN_NAV, AdminLayout(), PROVIDER_NAV, ROLE_META, AdminLogin(), ROLES, AdminDashboard(), GET() (+16 more)

### Community 6 - "route.ts"
Cohesion: 0.13
Nodes (21): AdminRoutes(), GET(), PATCH(), geistMono, geistSans, metadata, OPTIONS, Providers() (+13 more)

### Community 7 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "page.tsx"
Cohesion: 0.28
Nodes (7): AdminTrips(), FARE_COLORS, fetchBookings(), fetchSeatMap(), SeatInfo, SeatMapData, TripSeatPanel()

### Community 9 - "SokaSafari Travel — Web (Flights & Buses)"
Cohesion: 0.25
Nodes (7): Admin portals (`/admin`), Data: in-memory now, Supabase-ready, Pages, Project layout, Quick start, REST API (`/api/v1`), SokaSafari Travel — Web (Flights & Buses)

### Community 10 - "SokaSafari monorepo integration"
Cohesion: 0.29
Nodes (6): Env, Expo app, Git mirrors (push from monorepo), Operators (seed IDs), Push workflow, SokaSafari monorepo integration

### Community 11 - "proxy.ts"
Cohesion: 0.40
Nodes (4): config, CORS, isPublicApi(), proxy()

## Knowledge Gaps
- **107 isolated node(s):** `ADMIN_NAV`, `PROVIDER_NAV`, `ROLE_META`, `blank`, `blank` (+102 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `trips.ts`, `auth.ts`, `route.ts`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `isAdminAuthed()` connect `ok` to `utils.ts`, `auth.ts`, `route.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `cn()` connect `utils.ts` to `route.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `ADMIN_NAV`, `PROVIDER_NAV`, `ROLE_META` to the rest of the system?**
  _107 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07297514033680834 - nodes in this community are weakly interconnected._
- **Should `trips.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.083710407239819 - nodes in this community are weakly interconnected._
- **Should `ok` be split into smaller, more focused modules?**
  _Cohesion score 0.13783533765032377 - nodes in this community are weakly interconnected._