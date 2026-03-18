alter table public.jobs
  add column if not exists cancel_requested_at timestamptz,
  add column if not exists cancel_reason text,
  add column if not exists next_attempt_at timestamptz not null default now();

create index if not exists jobs_owner_status_next_attempt_idx
  on public.jobs (owner_id, status, next_attempt_at asc);

create index if not exists jobs_project_status_next_attempt_idx
  on public.jobs (project_id, status, next_attempt_at asc);
