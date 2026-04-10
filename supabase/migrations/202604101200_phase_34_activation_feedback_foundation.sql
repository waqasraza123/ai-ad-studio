alter table public.exports
  add column if not exists preview_asset_id uuid references public.assets (id) on delete set null;

create index if not exists exports_preview_asset_id_idx
  on public.exports (preview_asset_id);

with exact_preview_candidates as (
  select
    e.id as export_id,
    a.id as preview_asset_id,
    count(*) over (partition by e.id) as candidate_count
  from public.exports e
  join public.assets a
    on a.project_id = e.project_id
   and a.owner_id = e.owner_id
   and a.kind = 'concept_preview'
   and a.metadata ->> 'previewDataUrl' = e.render_metadata ->> 'previewDataUrl'
  where e.preview_asset_id is null
    and coalesce(e.render_metadata ->> 'previewDataUrl', '') <> ''
)
update public.exports e
set preview_asset_id = candidates.preview_asset_id
from (
  select export_id, preview_asset_id
  from exact_preview_candidates
  where candidate_count = 1
) as candidates
where e.id = candidates.export_id
  and e.preview_asset_id is null;

with concept_preview_candidates as (
  select
    e.id as export_id,
    a.id as preview_asset_id,
    count(*) over (partition by e.id) as candidate_count
  from public.exports e
  join public.assets a
    on a.project_id = e.project_id
   and a.owner_id = e.owner_id
   and a.kind = 'concept_preview'
   and a.metadata ->> 'conceptId' = e.concept_id::text
  where e.preview_asset_id is null
    and e.concept_id is not null
)
update public.exports e
set preview_asset_id = candidates.preview_asset_id
from (
  select export_id, preview_asset_id
  from concept_preview_candidates
  where candidate_count = 1
) as candidates
where e.id = candidates.export_id
  and e.preview_asset_id is null;

create table if not exists public.activation_packages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  render_batch_id uuid references public.render_batches (id) on delete set null,
  export_id uuid not null references public.exports (id) on delete cascade,
  canonical_export_id uuid references public.exports (id) on delete set null,
  channel text not null check (
    channel in ('meta', 'google', 'tiktok', 'internal_handoff')
  ),
  status text not null default 'ready' check (
    status in ('draft', 'ready', 'superseded', 'archived')
  ),
  readiness_status text not null default 'ready' check (
    readiness_status in ('blocked', 'ready')
  ),
  readiness_issues jsonb not null default '[]'::jsonb,
  manifest_version integer not null default 1 check (manifest_version > 0),
  manifest_json jsonb not null default '{}'::jsonb,
  channel_payload_json jsonb not null default '{}'::jsonb,
  asset_bundle_json jsonb not null default '{}'::jsonb,
  created_by_user_id uuid references auth.users (id) on delete set null,
  created_via text not null default 'owner_dashboard' check (
    created_via in ('owner_dashboard', 'operator_api')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activation_packages_owner_id_created_at_idx
  on public.activation_packages (owner_id, created_at desc);

create index if not exists activation_packages_export_id_channel_idx
  on public.activation_packages (export_id, channel, created_at desc);

create trigger activation_packages_set_updated_at
before update on public.activation_packages
for each row
execute function public.set_updated_at();

alter table public.activation_packages enable row level security;

drop policy if exists "activation_packages_select_own" on public.activation_packages;
create policy "activation_packages_select_own"
on public.activation_packages
for select
using (auth.uid() = owner_id);

drop policy if exists "activation_packages_insert_own" on public.activation_packages;
create policy "activation_packages_insert_own"
on public.activation_packages
for insert
with check (auth.uid() = owner_id);

drop policy if exists "activation_packages_update_own" on public.activation_packages;
create policy "activation_packages_update_own"
on public.activation_packages
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create table if not exists public.creative_performance_ingestion_batches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  source text not null check (
    source in ('manual_owner', 'manual_operator')
  ),
  channel text not null check (
    channel in ('meta', 'google', 'tiktok', 'internal_handoff')
  ),
  external_account_label text,
  notes text,
  submitted_by_user_id uuid references auth.users (id) on delete set null,
  operator_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creative_performance_batches_owner_id_created_at_idx
  on public.creative_performance_ingestion_batches (owner_id, created_at desc);

create trigger creative_performance_batches_set_updated_at
before update on public.creative_performance_ingestion_batches
for each row
execute function public.set_updated_at();

alter table public.creative_performance_ingestion_batches enable row level security;

drop policy if exists "creative_performance_batches_select_own" on public.creative_performance_ingestion_batches;
create policy "creative_performance_batches_select_own"
on public.creative_performance_ingestion_batches
for select
using (auth.uid() = owner_id);

drop policy if exists "creative_performance_batches_insert_own" on public.creative_performance_ingestion_batches;
create policy "creative_performance_batches_insert_own"
on public.creative_performance_ingestion_batches
for insert
with check (auth.uid() = owner_id);

drop policy if exists "creative_performance_batches_update_own" on public.creative_performance_ingestion_batches;
create policy "creative_performance_batches_update_own"
on public.creative_performance_ingestion_batches
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create table if not exists public.creative_performance_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  concept_id uuid references public.concepts (id) on delete set null,
  preview_asset_id uuid references public.assets (id) on delete set null,
  render_batch_id uuid references public.render_batches (id) on delete set null,
  export_id uuid references public.exports (id) on delete set null,
  canonical_export_id uuid references public.exports (id) on delete set null,
  activation_package_id uuid references public.activation_packages (id) on delete set null,
  ingestion_batch_id uuid not null references public.creative_performance_ingestion_batches (id) on delete cascade,
  channel text not null check (
    channel in ('meta', 'google', 'tiktok', 'internal_handoff')
  ),
  metric_date date not null,
  impressions bigint not null default 0 check (impressions >= 0),
  clicks bigint not null default 0 check (clicks >= 0),
  ctr numeric(12, 6) not null default 0 check (ctr >= 0),
  spend_usd numeric(12, 4) not null default 0 check (spend_usd >= 0),
  cpc numeric(12, 4) not null default 0 check (cpc >= 0),
  conversions bigint not null default 0 check (conversions >= 0),
  cpa numeric(12, 4) not null default 0 check (cpa >= 0),
  conversion_value_usd numeric(12, 4) not null default 0 check (conversion_value_usd >= 0),
  roas numeric(12, 6) not null default 0 check (roas >= 0),
  hook text,
  angle text,
  brand_tone text,
  call_to_action text,
  target_audience text,
  offer_text text,
  aspect_ratio text,
  platform_preset text,
  variant_key text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists creative_performance_records_owner_metric_date_idx
  on public.creative_performance_records (owner_id, metric_date desc, created_at desc);

create index if not exists creative_performance_records_export_metric_date_idx
  on public.creative_performance_records (export_id, metric_date desc);

create index if not exists creative_performance_records_canonical_metric_date_idx
  on public.creative_performance_records (canonical_export_id, metric_date desc);

alter table public.creative_performance_records enable row level security;

drop policy if exists "creative_performance_records_select_own" on public.creative_performance_records;
create policy "creative_performance_records_select_own"
on public.creative_performance_records
for select
using (auth.uid() = owner_id);

drop policy if exists "creative_performance_records_insert_own" on public.creative_performance_records;
create policy "creative_performance_records_insert_own"
on public.creative_performance_records
for insert
with check (auth.uid() = owner_id);

drop policy if exists "creative_performance_records_update_own" on public.creative_performance_records;
create policy "creative_performance_records_update_own"
on public.creative_performance_records
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

alter table public.billing_plans
  add column if not exists allow_activation_packages boolean not null default false,
  add column if not exists allow_creative_performance_ingestion boolean not null default false,
  add column if not exists allow_creative_performance_analytics boolean not null default false;

update public.billing_plans
set
  allow_activation_packages = code <> 'free',
  allow_creative_performance_ingestion = code <> 'free',
  allow_creative_performance_analytics = code <> 'free'
where code in ('free', 'starter', 'growth', 'scale');
