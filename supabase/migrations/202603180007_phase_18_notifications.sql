create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  export_id uuid references public.exports (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  severity text not null default 'info',
  action_url text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_owner_created_at_idx
  on public.notifications (owner_id, created_at desc);

create index if not exists notifications_owner_read_at_idx
  on public.notifications (owner_id, read_at, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
using (auth.uid() = owner_id);

drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own"
on public.notifications
for insert
with check (auth.uid() = owner_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own"
on public.notifications
for delete
using (auth.uid() = owner_id);
