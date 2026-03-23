alter table public.delivery_workspaces
  add column if not exists follow_up_last_notification_bucket text,
  add column if not exists follow_up_last_notification_date date;

create index if not exists delivery_workspaces_owner_follow_up_notification_idx
  on public.delivery_workspaces (
    owner_id,
    follow_up_status,
    follow_up_due_on,
    follow_up_last_notification_date,
    created_at desc
  );
