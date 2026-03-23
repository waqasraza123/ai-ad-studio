alter table public.delivery_workspaces
  add column if not exists follow_up_due_on date;

create index if not exists delivery_workspaces_owner_follow_up_due_on_idx
  on public.delivery_workspaces (owner_id, follow_up_status, follow_up_due_on, created_at desc);
