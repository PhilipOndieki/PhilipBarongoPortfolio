-- Lead Agent schema. Run once in the Supabase SQL editor.
-- If ADMIN_EMAIL is not info@philipondieki.co.ke, change the email in the policies below.

create extension if not exists pgcrypto;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  type text,
  area text,
  city text,
  phone text,
  email text,
  address text,
  map_url text,
  osm_id text unique,
  message text,
  status text not null default 'new'
    check (status in ('new','queued','sent','replied','interested','won','not_interested','skipped')),
  sort_order integer not null default 0,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.settings (
  id integer primary key default 1 check (id = 1),
  interval_min integer not null default 60 check (interval_min between 1 and 1440),
  last_sent_at timestamptz
);
insert into public.settings (id) values (1) on conflict do nothing;

create table public.taps (
  id bigint generated always as identity primary key,
  slug text not null references public.leads(slug) on delete cascade on update cascade,
  kind text not null check (kind in ('visit','contact')),
  created_at timestamptz not null default now()
);
create index taps_slug_idx on public.taps(slug);

-- updated_at trigger
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

-- Row Level Security: only the admin email can read or write
alter table public.leads enable row level security;
alter table public.settings enable row level security;
alter table public.taps enable row level security;

create policy admin_all_leads on public.leads for all to authenticated
  using ((auth.jwt() ->> 'email') = 'info@philipondieki.co.ke')
  with check ((auth.jwt() ->> 'email') = 'info@philipondieki.co.ke');
create policy admin_all_settings on public.settings for all to authenticated
  using ((auth.jwt() ->> 'email') = 'info@philipondieki.co.ke')
  with check ((auth.jwt() ->> 'email') = 'info@philipondieki.co.ke');
create policy admin_read_taps on public.taps for select to authenticated
  using ((auth.jwt() ->> 'email') = 'info@philipondieki.co.ke');
-- No public insert policy on taps. Inserts go through /api/t with the service role key.

alter publication supabase_realtime add table public.leads, public.settings, public.taps;
