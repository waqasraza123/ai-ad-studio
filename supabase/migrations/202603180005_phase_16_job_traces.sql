create table if not exists public.job_traces (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  trace_type text not null,
  stage text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists job_traces_job_id_created_at_idx
  on public.job_traces (job_id, created_at asc);

create index if not exists job_traces_project_id_created_at_idx
  on public.job_traces (project_id, created_at desc);

create index if not exists job_traces_owner_id_created_at_idx
  on public.job_traces (owner_id, created_at desc);

alter table public.job_traces enable row level security;

create policy "job_traces_select_own"
on public.job_traces
for select
using (auth.uid() = owner_id);

create policy "job_traces_insert_own"
on public.job_traces
for insert
with check (auth.uid() = owner_id);

create policy "job_traces_update_own"
on public.job_traces
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "job_traces_delete_own"
on public.job_traces
for delete
using (auth.uid() = owner_id);
