create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  concept_id uuid references public.concepts (id) on delete set null,
  status text not null default 'pending',
  decision_note text,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists approvals_job_id_unique_idx
  on public.approvals (job_id);

create index if not exists approvals_owner_created_at_idx
  on public.approvals (owner_id, created_at desc);

create index if not exists approvals_project_created_at_idx
  on public.approvals (project_id, created_at desc);

create index if not exists approvals_job_created_at_idx
  on public.approvals (job_id, created_at desc);

alter table public.approvals enable row level security;

create policy "approvals_select_own"
on public.approvals
for select
using (auth.uid() = owner_id);

create policy "approvals_insert_own"
on public.approvals
for insert
with check (auth.uid() = owner_id);

create policy "approvals_update_own"
on public.approvals
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "approvals_delete_own"
on public.approvals
for delete
using (auth.uid() = owner_id);
