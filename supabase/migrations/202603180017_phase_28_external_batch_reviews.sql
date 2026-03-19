create table if not exists public.batch_review_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  render_batch_id uuid not null references public.render_batches (id) on delete cascade,
  reviewer_name text not null,
  reviewer_email text,
  reviewer_role text not null default 'client',
  message text not null default '',
  token text not null unique,
  status text not null default 'active',
  response_status text not null default 'pending',
  response_note text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists batch_review_links_owner_created_at_idx
  on public.batch_review_links (owner_id, created_at desc);

create index if not exists batch_review_links_batch_created_at_idx
  on public.batch_review_links (render_batch_id, created_at desc);

create index if not exists batch_review_links_token_idx
  on public.batch_review_links (token);

alter table public.batch_review_links enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'batch_review_links'
      and policyname = 'batch_review_links_select_own'
  ) then
    create policy "batch_review_links_select_own"
    on public.batch_review_links
    for select
    using (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'batch_review_links'
      and policyname = 'batch_review_links_insert_own'
  ) then
    create policy "batch_review_links_insert_own"
    on public.batch_review_links
    for insert
    with check (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'batch_review_links'
      and policyname = 'batch_review_links_update_own'
  ) then
    create policy "batch_review_links_update_own"
    on public.batch_review_links
    for update
    using (auth.uid() = owner_id)
    with check (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'batch_review_links'
      and policyname = 'batch_review_links_delete_own'
  ) then
    create policy "batch_review_links_delete_own"
    on public.batch_review_links
    for delete
    using (auth.uid() = owner_id);
  end if;
end
$$;

create table if not exists public.batch_review_comments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  render_batch_id uuid not null references public.render_batches (id) on delete cascade,
  review_link_id uuid references public.batch_review_links (id) on delete set null,
  export_id uuid references public.exports (id) on delete set null,
  author_label text not null,
  reviewer_role text,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists batch_review_comments_owner_created_at_idx
  on public.batch_review_comments (owner_id, created_at desc);

create index if not exists batch_review_comments_batch_created_at_idx
  on public.batch_review_comments (render_batch_id, created_at desc);

create index if not exists batch_review_comments_export_created_at_idx
  on public.batch_review_comments (export_id, created_at desc);

alter table public.batch_review_comments enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'batch_review_comments'
      and policyname = 'batch_review_comments_select_own'
  ) then
    create policy "batch_review_comments_select_own"
    on public.batch_review_comments
    for select
    using (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'batch_review_comments'
      and policyname = 'batch_review_comments_insert_own'
  ) then
    create policy "batch_review_comments_insert_own"
    on public.batch_review_comments
    for insert
    with check (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'batch_review_comments'
      and policyname = 'batch_review_comments_update_own'
  ) then
    create policy "batch_review_comments_update_own"
    on public.batch_review_comments
    for update
    using (auth.uid() = owner_id)
    with check (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'batch_review_comments'
      and policyname = 'batch_review_comments_delete_own'
  ) then
    create policy "batch_review_comments_delete_own"
    on public.batch_review_comments
    for delete
    using (auth.uid() = owner_id);
  end if;
end
$$;

create or replace function public.get_public_batch_review_context(p_token text)
returns table (
  review_link_id uuid,
  render_batch_id uuid,
  project_id uuid,
  job_id uuid,
  project_name text,
  reviewer_name text,
  reviewer_role text,
  review_message text,
  response_status text,
  response_note text,
  responded_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    l.id as review_link_id,
    l.render_batch_id,
    l.project_id,
    b.job_id,
    p.name as project_name,
    l.reviewer_name,
    l.reviewer_role,
    l.message as review_message,
    l.response_status,
    l.response_note,
    l.responded_at
  from public.batch_review_links l
  join public.render_batches b
    on b.id = l.render_batch_id
  join public.projects p
    on p.id = l.project_id
  where l.token = p_token
    and l.status = 'active'
  limit 1
$$;

create or replace function public.list_public_batch_review_exports(p_token text)
returns table (
  export_id uuid,
  aspect_ratio text,
  platform_preset text,
  variant_key text,
  template_name text,
  preview_data_url text,
  created_at timestamptz,
  is_winner boolean
)
language sql
security definer
set search_path = public
as $$
  with active_link as (
    select render_batch_id
    from public.batch_review_links
    where token = p_token
      and status = 'active'
    limit 1
  )
  select
    e.id as export_id,
    e.aspect_ratio,
    e.platform_preset,
    e.variant_key,
    coalesce(e.render_metadata->>'templateName', '') as template_name,
    coalesce(a.metadata->>'previewDataUrl', '') as preview_data_url,
    e.created_at,
    (rb.winner_export_id = e.id) as is_winner
  from active_link al
  join public.render_batches rb
    on rb.id = al.render_batch_id
  join public.exports e
    on e.render_metadata->>'batchId' = rb.id::text
  left join public.assets a
    on a.id = e.asset_id
  order by coalesce(e.render_metadata->>'variantKey', e.variant_key), e.aspect_ratio
$$;

create or replace function public.list_public_batch_review_comments(p_token text)
returns table (
  comment_id uuid,
  export_id uuid,
  author_label text,
  reviewer_role text,
  body text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  with active_link as (
    select render_batch_id
    from public.batch_review_links
    where token = p_token
      and status = 'active'
    limit 1
  )
  select
    c.id as comment_id,
    c.export_id,
    c.author_label,
    c.reviewer_role,
    c.body,
    c.created_at
  from active_link al
  join public.batch_review_comments c
    on c.render_batch_id = al.render_batch_id
  order by c.created_at asc
$$;

create or replace function public.submit_public_batch_review_response(
  p_token text,
  p_response_status text,
  p_response_note text default null
)
returns table (
  review_link_id uuid,
  render_batch_id uuid,
  owner_id uuid,
  project_id uuid,
  job_id uuid,
  response_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.batch_review_links%rowtype;
  v_batch public.render_batches%rowtype;
  v_note text;
begin
  if p_response_status not in ('approved', 'rejected') then
    raise exception 'Invalid response status';
  end if;

  select *
  into v_link
  from public.batch_review_links
  where token = p_token
    and status = 'active'
  limit 1;

  if not found then
    raise exception 'Review link not found';
  end if;

  select *
  into v_batch
  from public.render_batches
  where id = v_link.render_batch_id;

  if not found then
    raise exception 'Render batch not found';
  end if;

  v_note := nullif(trim(coalesce(p_response_note, '')), '');

  update public.batch_review_links
  set
    response_status = p_response_status,
    response_note = v_note,
    responded_at = now(),
    updated_at = now()
  where id = v_link.id;

  insert into public.batch_review_comments (
    owner_id,
    project_id,
    render_batch_id,
    review_link_id,
    export_id,
    author_label,
    reviewer_role,
    body
  )
  values (
    v_link.owner_id,
    v_link.project_id,
    v_link.render_batch_id,
    v_link.id,
    null,
    coalesce(nullif(v_link.reviewer_name, ''), 'External reviewer'),
    v_link.reviewer_role,
    case
      when v_note is not null then v_note
      else 'Reviewer marked this batch as ' || p_response_status || '.'
    end
  );

  insert into public.job_traces (
    job_id,
    project_id,
    owner_id,
    trace_type,
    stage,
    payload
  )
  values (
    v_batch.job_id,
    v_link.project_id,
    v_link.owner_id,
    'external_review',
    'external_batch_review_response',
    jsonb_build_object(
      'reviewLinkId', v_link.id,
      'reviewerName', v_link.reviewer_name,
      'reviewerRole', v_link.reviewer_role,
      'responseStatus', p_response_status,
      'responseNote', v_note
    )
  );

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
    v_link.owner_id,
    v_link.project_id,
    null,
    v_batch.job_id,
    'external_batch_review_response',
    'External reviewer responded',
    coalesce(nullif(v_link.reviewer_name, ''), 'A reviewer') || ' marked the batch as ' || p_response_status || '.',
    case
      when p_response_status = 'approved' then 'success'
      else 'warning'
    end,
    '/dashboard/render-batches/' || v_link.render_batch_id::text,
    jsonb_build_object(
      'reviewLinkId', v_link.id,
      'reviewerRole', v_link.reviewer_role,
      'responseStatus', p_response_status
    )
  );

  return query
  select
    v_link.id,
    v_link.render_batch_id,
    v_link.owner_id,
    v_link.project_id,
    v_batch.job_id,
    p_response_status;
end;
$$;

create or replace function public.submit_public_batch_review_comment(
  p_token text,
  p_export_id uuid,
  p_author_label text,
  p_body text
)
returns table (
  comment_id uuid,
  render_batch_id uuid,
  owner_id uuid,
  project_id uuid,
  job_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.batch_review_links%rowtype;
  v_batch public.render_batches%rowtype;
  v_comment_id uuid;
  v_author_label text;
  v_body text;
  v_export_exists boolean;
begin
  select *
  into v_link
  from public.batch_review_links
  where token = p_token
    and status = 'active'
  limit 1;

  if not found then
    raise exception 'Review link not found';
  end if;

  select *
  into v_batch
  from public.render_batches
  where id = v_link.render_batch_id;

  if not found then
    raise exception 'Render batch not found';
  end if;

  v_author_label := nullif(trim(coalesce(p_author_label, '')), '');
  v_body := nullif(trim(coalesce(p_body, '')), '');

  if v_body is null then
    raise exception 'Comment body is required';
  end if;

  if p_export_id is not null then
    select exists (
      select 1
      from public.exports e
      where e.id = p_export_id
        and e.render_metadata->>'batchId' = v_batch.id::text
    )
    into v_export_exists;

    if not v_export_exists then
      raise exception 'Export does not belong to this batch';
    end if;
  end if;

  insert into public.batch_review_comments (
    owner_id,
    project_id,
    render_batch_id,
    review_link_id,
    export_id,
    author_label,
    reviewer_role,
    body
  )
  values (
    v_link.owner_id,
    v_link.project_id,
    v_link.render_batch_id,
    v_link.id,
    p_export_id,
    coalesce(v_author_label, nullif(v_link.reviewer_name, ''), 'External reviewer'),
    v_link.reviewer_role,
    v_body
  )
  returning id into v_comment_id;

  insert into public.job_traces (
    job_id,
    project_id,
    owner_id,
    trace_type,
    stage,
    payload
  )
  values (
    v_batch.job_id,
    v_link.project_id,
    v_link.owner_id,
    'external_review',
    'external_batch_review_comment',
    jsonb_build_object(
      'commentId', v_comment_id,
      'exportId', p_export_id,
      'reviewLinkId', v_link.id,
      'reviewerName', v_link.reviewer_name,
      'reviewerRole', v_link.reviewer_role
    )
  );

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
    v_link.owner_id,
    v_link.project_id,
    p_export_id,
    v_batch.job_id,
    'external_batch_review_comment',
    'External reviewer left a comment',
    coalesce(nullif(v_link.reviewer_name, ''), 'A reviewer') || ' commented on the batch review.',
    'info',
    '/dashboard/render-batches/' || v_link.render_batch_id::text,
    jsonb_build_object(
      'commentId', v_comment_id,
      'exportId', p_export_id,
      'reviewLinkId', v_link.id,
      'reviewerRole', v_link.reviewer_role
    )
  );

  return query
  select
    v_comment_id,
    v_link.render_batch_id,
    v_link.owner_id,
    v_link.project_id,
    v_batch.job_id;
end;
$$;
