create or replace function public.create_delivery_follow_up_reminder_notification(
  p_delivery_workspace_id uuid,
  p_today_date date,
  p_updated_at timestamptz,
  p_notification_title text,
  p_notification_body text,
  p_notification_kind text,
  p_notification_severity text,
  p_export_id uuid,
  p_project_id uuid,
  p_owner_id uuid
)
returns table (
  created boolean,
  reminder_bucket text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  workspace_record public.delivery_workspaces%rowtype;
  resolved_reminder_bucket text;
begin
  select *
  into workspace_record
  from public.delivery_workspaces
  where id = p_delivery_workspace_id
  for update;

  if not found then
    return query
    select false, null::text;
    return;
  end if;

  if workspace_record.status <> 'active' then
    return query
    select false, null::text;
    return;
  end if;

  if workspace_record.follow_up_status <> 'reminder_scheduled' then
    return query
    select false, null::text;
    return;
  end if;

  if workspace_record.follow_up_due_on is null then
    return query
    select false, null::text;
    return;
  end if;

  if workspace_record.follow_up_due_on > p_today_date then
    return query
    select false, null::text;
    return;
  end if;

  if workspace_record.follow_up_due_on < p_today_date then
    resolved_reminder_bucket := 'overdue';
  elsif workspace_record.follow_up_due_on = p_today_date then
    resolved_reminder_bucket := 'due_today';
  else
    return query
    select false, null::text;
    return;
  end if;

  if
    workspace_record.follow_up_last_notification_bucket = resolved_reminder_bucket
    and workspace_record.follow_up_last_notification_date = p_today_date
  then
    return query
    select false, resolved_reminder_bucket;
    return;
  end if;

  insert into public.notifications (
    owner_id,
    project_id,
    export_id,
    job_id,
    kind,
    title,
    body,
    severity,
    action_url,
    metadata
  )
  values (
    p_owner_id,
    p_project_id,
    p_export_id,
    null,
    p_notification_kind,
    p_notification_title,
    p_notification_body,
    p_notification_severity,
    '/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity',
    jsonb_build_object(
      'deliveryWorkspaceId',
      p_delivery_workspace_id,
      'followUpDueOn',
      workspace_record.follow_up_due_on,
      'reminderBucket',
      resolved_reminder_bucket
    )
  );

  update public.delivery_workspaces
  set
    follow_up_last_notification_bucket = resolved_reminder_bucket,
    follow_up_last_notification_date = p_today_date,
    updated_at = p_updated_at
  where id = p_delivery_workspace_id;

  return query
  select true, resolved_reminder_bucket;
end;
$$;

grant execute on function public.create_delivery_follow_up_reminder_notification(
  uuid,
  date,
  timestamptz,
  text,
  text,
  text,
  text,
  uuid,
  uuid,
  uuid
) to service_role;
