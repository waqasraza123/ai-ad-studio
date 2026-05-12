alter table public.activation_packages
  add column if not exists tracking_status text not null default 'tracking_ready' check (
    tracking_status in ('tracking_ready', 'active', 'historical')
  ),
  add column if not exists tracking_notes text,
  add column if not exists activated_at timestamptz,
  add column if not exists historical_at timestamptz;

create index if not exists activation_packages_owner_tracking_status_idx
  on public.activation_packages (owner_id, tracking_status, updated_at desc);

create table if not exists public.activation_package_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  activation_package_id uuid not null references public.activation_packages (id) on delete cascade,
  export_id uuid not null references public.exports (id) on delete cascade,
  event_type text not null check (
    event_type in ('tracking_status_changed')
  ),
  previous_tracking_status text,
  next_tracking_status text not null check (
    next_tracking_status in ('tracking_ready', 'active', 'historical')
  ),
  notes text,
  created_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists activation_package_events_owner_created_at_idx
  on public.activation_package_events (owner_id, created_at desc);

create index if not exists activation_package_events_package_created_at_idx
  on public.activation_package_events (activation_package_id, created_at desc);

alter table public.activation_package_events enable row level security;

drop policy if exists "activation_package_events_select_own" on public.activation_package_events;
create policy "activation_package_events_select_own"
on public.activation_package_events
for select
using (auth.uid() = owner_id);

drop policy if exists "activation_package_events_insert_own" on public.activation_package_events;
create policy "activation_package_events_insert_own"
on public.activation_package_events
for insert
with check (auth.uid() = owner_id);

grant select, insert on table public.activation_package_events to authenticated;
