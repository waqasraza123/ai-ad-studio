create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  export_id uuid references public.exports (id) on delete set null,
  provider text not null,
  event_type text not null,
  units numeric not null default 0,
  estimated_cost_usd numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_owner_id_created_at_idx
  on public.usage_events (owner_id, created_at desc);

create index if not exists usage_events_project_id_created_at_idx
  on public.usage_events (project_id, created_at desc);

create index if not exists usage_events_export_id_created_at_idx
  on public.usage_events (export_id, created_at desc);

alter table public.usage_events enable row level security;

create policy "usage_events_select_own"
on public.usage_events
for select
using (auth.uid() = owner_id);

create policy "usage_events_insert_own"
on public.usage_events
for insert
with check (auth.uid() = owner_id);

create policy "usage_events_update_own"
on public.usage_events
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "usage_events_delete_own"
on public.usage_events
for delete
using (auth.uid() = owner_id);
