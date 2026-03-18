create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  export_id uuid not null references public.exports (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  token text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists share_links_project_id_created_at_idx
  on public.share_links (project_id, created_at desc);

create index if not exists share_links_export_id_created_at_idx
  on public.share_links (export_id, created_at desc);

alter table public.share_links enable row level security;

drop policy if exists "share_links_select_own" on public.share_links;
drop policy if exists "share_links_insert_own" on public.share_links;
drop policy if exists "share_links_update_own" on public.share_links;
drop policy if exists "share_links_delete_own" on public.share_links;

create policy "share_links_select_own"
on public.share_links
for select
using (auth.uid() = owner_id);

create policy "share_links_insert_own"
on public.share_links
for insert
with check (auth.uid() = owner_id);

create policy "share_links_update_own"
on public.share_links
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "share_links_delete_own"
on public.share_links
for delete
using (auth.uid() = owner_id);
