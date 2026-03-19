alter table public.showcase_items
  add column if not exists render_batch_id uuid references public.render_batches (id) on delete set null;

create index if not exists showcase_items_render_batch_idx
  on public.showcase_items (render_batch_id);

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'showcase_items'
      and policyname = 'showcase_items_select_published_public'
  ) then
    create policy "showcase_items_select_published_public"
    on public.showcase_items
    for select
    using (is_published = true);
  end if;
end
$$;

create table if not exists public.share_campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  render_batch_id uuid references public.render_batches (id) on delete set null,
  export_id uuid not null references public.exports (id) on delete cascade,
  title text not null,
  message text not null,
  token text not null unique,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (export_id)
);

create index if not exists share_campaigns_owner_created_at_idx
  on public.share_campaigns (owner_id, created_at desc);

create index if not exists share_campaigns_render_batch_idx
  on public.share_campaigns (render_batch_id);

create index if not exists share_campaigns_status_idx
  on public.share_campaigns (status, created_at desc);

alter table public.share_campaigns enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'share_campaigns'
      and policyname = 'share_campaigns_select_own'
  ) then
    create policy "share_campaigns_select_own"
    on public.share_campaigns
    for select
    using (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'share_campaigns'
      and policyname = 'share_campaigns_insert_own'
  ) then
    create policy "share_campaigns_insert_own"
    on public.share_campaigns
    for insert
    with check (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'share_campaigns'
      and policyname = 'share_campaigns_update_own'
  ) then
    create policy "share_campaigns_update_own"
    on public.share_campaigns
    for update
    using (auth.uid() = owner_id)
    with check (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'share_campaigns'
      and policyname = 'share_campaigns_delete_own'
  ) then
    create policy "share_campaigns_delete_own"
    on public.share_campaigns
    for delete
    using (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'share_campaigns'
      and policyname = 'share_campaigns_select_active_public'
  ) then
    create policy "share_campaigns_select_active_public"
    on public.share_campaigns
    for select
    using (status = 'active');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'exports'
      and policyname = 'exports_select_promoted_public'
  ) then
    create policy "exports_select_promoted_public"
    on public.exports
    for select
    using (
      exists (
        select 1
        from public.showcase_items
        where showcase_items.export_id = exports.id
          and showcase_items.is_published = true
      )
      or exists (
        select 1
        from public.share_campaigns
        where share_campaigns.export_id = exports.id
          and share_campaigns.status = 'active'
      )
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'assets'
      and policyname = 'assets_select_promoted_public'
  ) then
    create policy "assets_select_promoted_public"
    on public.assets
    for select
    using (
      exists (
        select 1
        from public.exports
        where public.exports.asset_id = assets.id
          and (
            exists (
              select 1
              from public.showcase_items
              where public.showcase_items.export_id = public.exports.id
                and public.showcase_items.is_published = true
            )
            or exists (
              select 1
              from public.share_campaigns
              where public.share_campaigns.export_id = public.exports.id
                and public.share_campaigns.status = 'active'
            )
          )
      )
    );
  end if;
end
$$;
