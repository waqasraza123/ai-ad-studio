create table if not exists public.delivery_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  render_batch_id uuid not null references public.render_batches (id) on delete cascade,
  canonical_export_id uuid not null references public.exports (id) on delete cascade,
  title text not null,
  summary text not null default '',
  handoff_notes text not null default '',
  approval_summary jsonb not null default '{}'::jsonb,
  token text not null unique,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (canonical_export_id)
);

create index if not exists delivery_workspaces_owner_created_at_idx
  on public.delivery_workspaces (owner_id, created_at desc);

create index if not exists delivery_workspaces_project_created_at_idx
  on public.delivery_workspaces (project_id, created_at desc);

create index if not exists delivery_workspaces_token_idx
  on public.delivery_workspaces (token);

alter table public.delivery_workspaces enable row level security;

drop policy if exists "delivery_workspaces_select_own" on public.delivery_workspaces;
create policy "delivery_workspaces_select_own"
on public.delivery_workspaces
for select
using (auth.uid() = owner_id);

drop policy if exists "delivery_workspaces_insert_own" on public.delivery_workspaces;
create policy "delivery_workspaces_insert_own"
on public.delivery_workspaces
for insert
with check (auth.uid() = owner_id);

drop policy if exists "delivery_workspaces_update_own" on public.delivery_workspaces;
create policy "delivery_workspaces_update_own"
on public.delivery_workspaces
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "delivery_workspaces_delete_own" on public.delivery_workspaces;
create policy "delivery_workspaces_delete_own"
on public.delivery_workspaces
for delete
using (auth.uid() = owner_id);

drop policy if exists "delivery_workspaces_select_active_public" on public.delivery_workspaces;
create policy "delivery_workspaces_select_active_public"
on public.delivery_workspaces
for select
using (status = 'active');

create table if not exists public.delivery_workspace_exports (
  id uuid primary key default gen_random_uuid(),
  delivery_workspace_id uuid not null references public.delivery_workspaces (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  export_id uuid not null references public.exports (id) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (delivery_workspace_id, export_id)
);

create index if not exists delivery_workspace_exports_workspace_sort_idx
  on public.delivery_workspace_exports (delivery_workspace_id, sort_order asc, created_at asc);

create index if not exists delivery_workspace_exports_export_idx
  on public.delivery_workspace_exports (export_id);

alter table public.delivery_workspace_exports enable row level security;

drop policy if exists "delivery_workspace_exports_select_own" on public.delivery_workspace_exports;
create policy "delivery_workspace_exports_select_own"
on public.delivery_workspace_exports
for select
using (auth.uid() = owner_id);

drop policy if exists "delivery_workspace_exports_insert_own" on public.delivery_workspace_exports;
create policy "delivery_workspace_exports_insert_own"
on public.delivery_workspace_exports
for insert
with check (auth.uid() = owner_id);

drop policy if exists "delivery_workspace_exports_update_own" on public.delivery_workspace_exports;
create policy "delivery_workspace_exports_update_own"
on public.delivery_workspace_exports
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "delivery_workspace_exports_delete_own" on public.delivery_workspace_exports;
create policy "delivery_workspace_exports_delete_own"
on public.delivery_workspace_exports
for delete
using (auth.uid() = owner_id);

drop policy if exists "delivery_workspace_exports_select_active_public" on public.delivery_workspace_exports;
create policy "delivery_workspace_exports_select_active_public"
on public.delivery_workspace_exports
for select
using (
  exists (
    select 1
    from public.delivery_workspaces dw
    where dw.id = delivery_workspace_exports.delivery_workspace_id
      and dw.status = 'active'
  )
);

drop policy if exists "exports_select_delivery_workspace_public" on public.exports;
create policy "exports_select_delivery_workspace_public"
on public.exports
for select
using (
  exists (
    select 1
    from public.delivery_workspaces dw
    where dw.canonical_export_id = exports.id
      and dw.status = 'active'
  )
  or exists (
    select 1
    from public.delivery_workspace_exports dwe
    join public.delivery_workspaces dw
      on dw.id = dwe.delivery_workspace_id
    where dwe.export_id = exports.id
      and dw.status = 'active'
  )
);
drop policy if exists "assets_select_delivery_workspace_public" on public.assets;
create policy "assets_select_delivery_workspace_public"
on public.assets
for select
using (
  exists (
    select 1
    from public.exports e
    join public.delivery_workspaces dw
      on dw.canonical_export_id = e.id
    where e.asset_id = assets.id
      and dw.status = 'active'
  )
  or exists (
    select 1
    from public.exports e
    join public.delivery_workspace_exports dwe
      on dwe.export_id = e.id
    join public.delivery_workspaces dw
      on dw.id = dwe.delivery_workspace_id
    where e.asset_id = assets.id
      and dw.status = 'active'
  )
);
