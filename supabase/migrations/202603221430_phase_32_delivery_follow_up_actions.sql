alter table public.delivery_workspaces
  add column if not exists follow_up_status text not null default 'none',
  add column if not exists follow_up_note text,
  add column if not exists follow_up_updated_at timestamptz;

create index if not exists delivery_workspaces_owner_follow_up_status_idx
  on public.delivery_workspaces (owner_id, follow_up_status, created_at desc);
