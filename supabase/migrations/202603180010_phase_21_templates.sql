create table if not exists public.ad_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  style_key text not null,
  description text not null,
  scene_pack jsonb not null default '[]'::jsonb,
  cta_preset jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ad_templates_owner_created_at_idx
  on public.ad_templates (owner_id, created_at desc);

alter table public.ad_templates enable row level security;

create policy "ad_templates_select_own"
on public.ad_templates
for select
using (auth.uid() = owner_id);

create policy "ad_templates_insert_own"
on public.ad_templates
for insert
with check (auth.uid() = owner_id);

create policy "ad_templates_update_own"
on public.ad_templates
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "ad_templates_delete_own"
on public.ad_templates
for delete
using (auth.uid() = owner_id);

alter table public.projects
  add column if not exists template_id uuid references public.ad_templates (id) on delete set null;
