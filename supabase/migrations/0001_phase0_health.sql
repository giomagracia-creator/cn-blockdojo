-- Phase 0 connectivity table. No Ninja data.
-- Row-level security is on and no policy is granted, so the anon key cannot read or write it.
-- The web health check only pings the Supabase REST root. It does not query this table.

create table if not exists public.health_pings (
  id bigint generated always as identity primary key,
  source text not null,
  created_at timestamptz not null default now()
);

alter table public.health_pings enable row level security;
