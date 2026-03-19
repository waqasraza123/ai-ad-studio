create table if not exists public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  logo_asset_id uuid references public.assets (id) on delete set null,
  palette jsonb not null default '{}'::jsonb,
  typography jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brand_kits_owner_created_at_idx
  on public.brand_kits (owner_id, created_at desc);

alter table public.brand_kits enable row level security;

drop policy if exists "brand_kits_select_own" on public.brand_kits;
create policy "brand_kits_select_own"
on public.brand_kits
for select
using (auth.uid() = owner_id);

drop policy if exists "brand_kits_insert_own" on public.brand_kits;
create policy "brand_kits_insert_own"
on public.brand_kits
for insert
with check (auth.uid() = owner_id);

drop policy if exists "brand_kits_update_own" on public.brand_kits;
create policy "brand_kits_update_own"
on public.brand_kits
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "brand_kits_delete_own" on public.brand_kits;
create policy "brand_kits_delete_own"
on public.brand_kits
for delete
using (auth.uid() = owner_id);

alter table public.projects
  add column if not exists brand_kit_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_brand_kit_id_fkey'
  ) then
    alter table public.projects
      add constraint projects_brand_kit_id_fkey
      foreign key (brand_kit_id)
      references public.brand_kits (id)
      on delete set null;
  end if;
end
$$;
