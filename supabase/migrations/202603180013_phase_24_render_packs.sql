create table if not exists public.platform_render_packs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  platform_preset text not null,
  aspect_ratio text not null,
  safe_zone jsonb not null default '{}'::jsonb,
  caption_layout jsonb not null default '{}'::jsonb,
  cta_timing jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_render_packs_owner_created_at_idx
  on public.platform_render_packs (owner_id, created_at desc);

create index if not exists platform_render_packs_platform_aspect_idx
  on public.platform_render_packs (owner_id, platform_preset, aspect_ratio);

alter table public.platform_render_packs enable row level security;

drop policy if exists "platform_render_packs_select_own" on public.platform_render_packs;
create policy "platform_render_packs_select_own"
on public.platform_render_packs
for select
using (auth.uid() = owner_id);

drop policy if exists "platform_render_packs_insert_own" on public.platform_render_packs;
create policy "platform_render_packs_insert_own"
on public.platform_render_packs
for insert
with check (auth.uid() = owner_id);

drop policy if exists "platform_render_packs_update_own" on public.platform_render_packs;
create policy "platform_render_packs_update_own"
on public.platform_render_packs
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "platform_render_packs_delete_own" on public.platform_render_packs;
create policy "platform_render_packs_delete_own"
on public.platform_render_packs
for delete
using (auth.uid() = owner_id);
