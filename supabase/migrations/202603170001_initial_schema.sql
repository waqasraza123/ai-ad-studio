create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (
    status in (
      'draft',
      'generating_concepts',
      'concepts_ready',
      'rendering',
      'export_ready',
      'failed'
    )
  ),
  selected_concept_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_inputs (
  project_id uuid primary key references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  product_name text,
  product_description text,
  offer_text text,
  call_to_action text,
  target_audience text,
  brand_tone text,
  visual_style text,
  duration_seconds integer not null default 10,
  aspect_ratio text not null default '9:16',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  storage_key text not null,
  mime_type text not null,
  width integer,
  height integer,
  duration_ms integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.concepts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  angle text not null,
  hook text not null,
  script text not null,
  caption_style text,
  visual_direction text,
  status text not null default 'planned' check (
    status in (
      'planned',
      'preview_generating',
      'preview_ready',
      'selected',
      'render_queued',
      'rendered',
      'failed'
    )
  ),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (
    type in (
      'generate_concepts',
      'generate_concept_preview',
      'render_final_ad',
      'cleanup_assets'
    )
  ),
  status text not null default 'queued' check (
    status in (
      'queued',
      'running',
      'waiting_provider',
      'succeeded',
      'failed',
      'cancelled'
    )
  ),
  provider text,
  provider_job_id text,
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  error jsonb not null default '{}'::jsonb,
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  scheduled_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  heartbeat_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  concept_id uuid references public.concepts (id) on delete set null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  asset_id uuid references public.assets (id) on delete set null,
  status text not null default 'queued' check (
    status in ('queued', 'rendering', 'ready', 'failed')
  ),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects
  add constraint projects_selected_concept_id_fkey
  foreign key (selected_concept_id)
  references public.concepts (id)
  on delete set null;

create index if not exists projects_owner_id_created_at_idx
  on public.projects (owner_id, created_at desc);

create index if not exists assets_project_id_created_at_idx
  on public.assets (project_id, created_at desc);

create index if not exists concepts_project_id_sort_order_idx
  on public.concepts (project_id, sort_order asc);

create index if not exists jobs_project_id_created_at_idx
  on public.jobs (project_id, created_at desc);

create index if not exists exports_project_id_created_at_idx
  on public.exports (project_id, created_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

create trigger project_inputs_set_updated_at
before update on public.project_inputs
for each row
execute function public.set_updated_at();

create trigger concepts_set_updated_at
before update on public.concepts
for each row
execute function public.set_updated_at();

create trigger jobs_set_updated_at
before update on public.jobs
for each row
execute function public.set_updated_at();

create trigger exports_set_updated_at
before update on public.exports
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_inputs enable row level security;
alter table public.assets enable row level security;
alter table public.concepts enable row level security;
alter table public.jobs enable row level security;
alter table public.exports enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "projects_select_own"
on public.projects
for select
using (auth.uid() = owner_id);

create policy "projects_insert_own"
on public.projects
for insert
with check (auth.uid() = owner_id);

create policy "projects_update_own"
on public.projects
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "projects_delete_own"
on public.projects
for delete
using (auth.uid() = owner_id);

create policy "project_inputs_select_own"
on public.project_inputs
for select
using (auth.uid() = owner_id);

create policy "project_inputs_insert_own"
on public.project_inputs
for insert
with check (auth.uid() = owner_id);

create policy "project_inputs_update_own"
on public.project_inputs
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "project_inputs_delete_own"
on public.project_inputs
for delete
using (auth.uid() = owner_id);

create policy "assets_select_own"
on public.assets
for select
using (auth.uid() = owner_id);

create policy "assets_insert_own"
on public.assets
for insert
with check (auth.uid() = owner_id);

create policy "assets_update_own"
on public.assets
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "assets_delete_own"
on public.assets
for delete
using (auth.uid() = owner_id);

create policy "concepts_select_own"
on public.concepts
for select
using (auth.uid() = owner_id);

create policy "concepts_insert_own"
on public.concepts
for insert
with check (auth.uid() = owner_id);

create policy "concepts_update_own"
on public.concepts
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "concepts_delete_own"
on public.concepts
for delete
using (auth.uid() = owner_id);

create policy "jobs_select_own"
on public.jobs
for select
using (auth.uid() = owner_id);

create policy "jobs_insert_own"
on public.jobs
for insert
with check (auth.uid() = owner_id);

create policy "jobs_update_own"
on public.jobs
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "jobs_delete_own"
on public.jobs
for delete
using (auth.uid() = owner_id);

create policy "exports_select_own"
on public.exports
for select
using (auth.uid() = owner_id);

create policy "exports_insert_own"
on public.exports
for insert
with check (auth.uid() = owner_id);

create policy "exports_update_own"
on public.exports
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "exports_delete_own"
on public.exports
for delete
using (auth.uid() = owner_id);
