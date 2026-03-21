create table if not exists public.delivery_workspace_events (
  id uuid primary key default gen_random_uuid(),
  delivery_workspace_id uuid not null references public.delivery_workspaces (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  export_id uuid references public.exports (id) on delete set null,
  event_type text not null,
  actor_label text,
  metadata jsonb not null default {}::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists delivery_workspace_events_workspace_created_at_idx
  on public.delivery_workspace_events (delivery_workspace_id, created_at desc);

create index if not exists delivery_workspace_events_owner_created_at_idx
  on public.delivery_workspace_events (owner_id, created_at desc);

create index if not exists delivery_workspace_events_project_created_at_idx
  on public.delivery_workspace_events (project_id, created_at desc);

create index if not exists delivery_workspace_events_event_type_created_at_idx
  on public.delivery_workspace_events (event_type, created_at desc);

alter table public.delivery_workspace_events enable row level security;

drop policy if exists "delivery_workspace_events_select_own" on public.delivery_workspace_events;
create policy "delivery_workspace_events_select_own"
on public.delivery_workspace_events
for select
using (auth.uid() = owner_id);

drop policy if exists "delivery_workspace_events_insert_own" on public.delivery_workspace_events;
create policy "delivery_workspace_events_insert_own"
on public.delivery_workspace_events
for insert
with check (auth.uid() = owner_id);
