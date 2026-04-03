alter table public.delivery_workspaces
  add column if not exists reminder_mismatch_resolved_notification_id text,
  add column if not exists reminder_mismatch_resolved_at timestamptz,
  add column if not exists reminder_mismatch_resolution_note text;

alter table public.delivery_workspaces
  drop constraint if exists delivery_workspaces_reminder_mismatch_resolution_note_length_check;

alter table public.delivery_workspaces
  add constraint delivery_workspaces_reminder_mismatch_resolution_note_length_check
  check (
    reminder_mismatch_resolution_note is null
    or char_length(reminder_mismatch_resolution_note) <= 500
  );
