-- Run once in the travel Supabase SQL editor (same project as bookings).
-- Makes admin "My Routes" Save prices visible to the mobile app across Vercel instances.

create table if not exists route_fare_overrides (
  route_key text primary key,
  base_price numeric(10,2) not null check (base_price >= 1),
  updated_at timestamptz not null default now()
);

alter table route_fare_overrides enable row level security;
