create table if not exists public.render_batches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  concept_id uuid not null references public.concepts (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  status text not null default 'queued',
  platform_preset text not null,
  aspect_ratios jsonb not null default '["9:16"]'::jsonb,
  variant_keys jsonb not null default '["default"]'::jsonb,
  export_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id)
);

create index if not exists render_batches_owner_created_at_idx
  on public.render_batches (owner_id, created_at desc);

create index if not exists render_batches_project_created_at_idx
  on public.render_batches (project_id, created_at desc);

alter table public.render_batches enable row level security;

drop policy if exists "render_batches_select_own" on public.render_batches;
create policy "render_batches_select_own"
on public.render_batches
for select
using (auth.uid() = owner_id);

drop policy if exists "render_batches_insert_own" on public.render_batches;
create policy "render_batches_insert_own"
on public.render_batches
for insert
with check (auth.uid() = owner_id);

drop policy if exists "render_batches_update_own" on public.render_batches;
create policy "render_batches_update_own"
on public.render_batches
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "render_batches_delete_own" on public.render_batches;
create policy "render_batches_delete_own"
on public.render_batches
for delete
using (auth.uid() = owner_id);
