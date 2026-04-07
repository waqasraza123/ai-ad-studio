create table if not exists public.billing_plans (
  code text primary key,
  display_name text not null,
  monthly_price_usd numeric(10, 2) not null default 0,
  included_active_projects integer not null,
  included_concept_runs integer not null,
  included_preview_generations integer not null,
  included_render_batches integer not null,
  included_final_exports integer not null,
  included_storage_bytes bigint not null,
  max_concurrent_preview_jobs integer not null,
  max_concurrent_render_jobs integer not null,
  allow_share_links boolean not null default true,
  allow_public_showcase boolean not null default false,
  allow_share_campaigns boolean not null default false,
  allow_delivery_workspaces boolean not null default false,
  allow_external_batch_reviews boolean not null default false,
  watermark_exports boolean not null default false,
  allow_manual_invoice boolean not null default false,
  allow_overage boolean not null default false,
  monthly_overage_cap_usd numeric(10, 2) not null default 0,
  concept_run_overage_usd numeric(10, 2) not null default 0,
  preview_generation_overage_usd numeric(10, 2) not null default 0,
  render_batch_overage_usd numeric(10, 2) not null default 0,
  storage_gb_month_overage_usd numeric(10, 2) not null default 0,
  internal_total_cost_ceiling_usd numeric(10, 2) not null default 0,
  internal_openai_cost_ceiling_usd numeric(10, 2) not null default 0,
  internal_runway_cost_ceiling_usd numeric(10, 2) not null default 0,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_plans_nonnegative_monthly_price_check
    check (monthly_price_usd >= 0),
  constraint billing_plans_positive_project_limit_check
    check (included_active_projects > 0),
  constraint billing_plans_nonnegative_included_limits_check
    check (
      included_concept_runs >= 0 and
      included_preview_generations >= 0 and
      included_render_batches >= 0 and
      included_final_exports >= 0 and
      included_storage_bytes >= 0
    ),
  constraint billing_plans_positive_concurrency_check
    check (
      max_concurrent_preview_jobs > 0 and
      max_concurrent_render_jobs > 0
    ),
  constraint billing_plans_nonnegative_overage_check
    check (
      monthly_overage_cap_usd >= 0 and
      concept_run_overage_usd >= 0 and
      preview_generation_overage_usd >= 0 and
      render_batch_overage_usd >= 0 and
      storage_gb_month_overage_usd >= 0 and
      internal_total_cost_ceiling_usd >= 0 and
      internal_openai_cost_ceiling_usd >= 0 and
      internal_runway_cost_ceiling_usd >= 0
    )
);

create table if not exists public.owner_billing_accounts (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text,
  stripe_default_payment_method_id text,
  billing_country text,
  checkout_preference text not null default 'card_or_crypto' check (
    checkout_preference in ('card_or_crypto', 'stablecoin_preferred', 'invoice')
  ),
  tax_exempt boolean not null default false,
  stablecoin_eligible boolean not null default true,
  manual_invoice_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.owner_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  plan_code text not null references public.billing_plans (code),
  provider text not null default 'system',
  status text not null default 'free' check (
    status in (
      'free',
      'trialing',
      'active',
      'past_due',
      'grace_period',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'unpaid'
    )
  ),
  stripe_subscription_id text,
  stripe_subscription_item_id text,
  stripe_price_id text,
  stripe_checkout_session_id text,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  payment_failed_at timestamptz,
  grace_period_ends_at timestamptz,
  downgrade_to_plan_code text references public.billing_plans (code),
  overage_cap_usd numeric(10, 2) not null default 0,
  manual_payment_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint owner_subscriptions_owner_id_unique unique (owner_id),
  constraint owner_subscriptions_current_period_order_check
    check (current_period_end > current_period_start),
  constraint owner_subscriptions_overage_cap_nonnegative_check
    check (overage_cap_usd >= 0)
);

create table if not exists public.billing_usage_rollups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  plan_code text not null references public.billing_plans (code),
  period_start timestamptz not null,
  period_end timestamptz not null,
  active_projects_used integer not null default 0,
  concept_runs_used integer not null default 0,
  preview_generations_used integer not null default 0,
  render_batches_used integer not null default 0,
  final_exports_used integer not null default 0,
  storage_bytes_used bigint not null default 0,
  provider_cost_usd numeric(10, 2) not null default 0,
  projected_overage_usd numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_usage_rollups_owner_period_unique
    unique (owner_id, period_start),
  constraint billing_usage_rollups_period_order_check
    check (period_end > period_start),
  constraint billing_usage_rollups_nonnegative_check
    check (
      active_projects_used >= 0 and
      concept_runs_used >= 0 and
      preview_generations_used >= 0 and
      render_batches_used >= 0 and
      final_exports_used >= 0 and
      storage_bytes_used >= 0 and
      provider_cost_usd >= 0 and
      projected_overage_usd >= 0
    )
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade,
  subscription_id uuid references public.owner_subscriptions (id) on delete set null,
  provider text not null default 'system',
  provider_event_id text,
  event_type text not null,
  event_status text not null default 'processed' check (
    event_status in ('received', 'processed', 'ignored', 'failed')
  ),
  summary text,
  payload jsonb not null default '{}'::jsonb,
  event_occurred_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists billing_events_provider_event_unique_idx
  on public.billing_events (provider, provider_event_id)
  where provider_event_id is not null;

create unique index if not exists owner_subscriptions_stripe_subscription_id_unique_idx
  on public.owner_subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

create unique index if not exists owner_subscriptions_stripe_checkout_session_id_unique_idx
  on public.owner_subscriptions (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists billing_usage_rollups_owner_id_period_start_idx
  on public.billing_usage_rollups (owner_id, period_start desc);

create index if not exists owner_subscriptions_owner_id_status_idx
  on public.owner_subscriptions (owner_id, status);

create index if not exists billing_events_owner_id_event_occurred_at_idx
  on public.billing_events (owner_id, event_occurred_at desc);

create trigger billing_plans_set_updated_at
before update on public.billing_plans
for each row
execute function public.set_updated_at();

create trigger owner_billing_accounts_set_updated_at
before update on public.owner_billing_accounts
for each row
execute function public.set_updated_at();

create trigger owner_subscriptions_set_updated_at
before update on public.owner_subscriptions
for each row
execute function public.set_updated_at();

create trigger billing_usage_rollups_set_updated_at
before update on public.billing_usage_rollups
for each row
execute function public.set_updated_at();

alter table public.billing_plans enable row level security;
alter table public.owner_billing_accounts enable row level security;
alter table public.owner_subscriptions enable row level security;
alter table public.billing_usage_rollups enable row level security;
alter table public.billing_events enable row level security;

drop policy if exists "billing_plans_select_all" on public.billing_plans;
create policy "billing_plans_select_all"
on public.billing_plans
for select
using (true);

drop policy if exists "owner_billing_accounts_select_own" on public.owner_billing_accounts;
create policy "owner_billing_accounts_select_own"
on public.owner_billing_accounts
for select
using (auth.uid() = owner_id);

drop policy if exists "owner_billing_accounts_insert_own" on public.owner_billing_accounts;
create policy "owner_billing_accounts_insert_own"
on public.owner_billing_accounts
for insert
with check (auth.uid() = owner_id);

drop policy if exists "owner_billing_accounts_update_own" on public.owner_billing_accounts;
create policy "owner_billing_accounts_update_own"
on public.owner_billing_accounts
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "owner_subscriptions_select_own" on public.owner_subscriptions;
create policy "owner_subscriptions_select_own"
on public.owner_subscriptions
for select
using (auth.uid() = owner_id);

drop policy if exists "owner_subscriptions_insert_own" on public.owner_subscriptions;
create policy "owner_subscriptions_insert_own"
on public.owner_subscriptions
for insert
with check (auth.uid() = owner_id);

drop policy if exists "owner_subscriptions_update_own" on public.owner_subscriptions;
create policy "owner_subscriptions_update_own"
on public.owner_subscriptions
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "billing_usage_rollups_select_own" on public.billing_usage_rollups;
create policy "billing_usage_rollups_select_own"
on public.billing_usage_rollups
for select
using (auth.uid() = owner_id);

drop policy if exists "billing_usage_rollups_insert_own" on public.billing_usage_rollups;
create policy "billing_usage_rollups_insert_own"
on public.billing_usage_rollups
for insert
with check (auth.uid() = owner_id);

drop policy if exists "billing_usage_rollups_update_own" on public.billing_usage_rollups;
create policy "billing_usage_rollups_update_own"
on public.billing_usage_rollups
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "billing_events_select_own" on public.billing_events;
create policy "billing_events_select_own"
on public.billing_events
for select
using (auth.uid() = owner_id);

grant select on table public.billing_plans to anon;
grant select on table public.billing_plans to authenticated;
grant select, insert, update on table public.owner_billing_accounts to authenticated;
grant select, insert, update on table public.owner_subscriptions to authenticated;
grant select, insert, update on table public.billing_usage_rollups to authenticated;
grant select on table public.billing_events to authenticated;
grant select, insert, update, delete on table public.billing_plans to service_role;
grant select, insert, update, delete on table public.owner_billing_accounts to service_role;
grant select, insert, update, delete on table public.owner_subscriptions to service_role;
grant select, insert, update, delete on table public.billing_usage_rollups to service_role;
grant select, insert, update, delete on table public.billing_events to service_role;

insert into public.billing_plans (
  code,
  display_name,
  monthly_price_usd,
  included_active_projects,
  included_concept_runs,
  included_preview_generations,
  included_render_batches,
  included_final_exports,
  included_storage_bytes,
  max_concurrent_preview_jobs,
  max_concurrent_render_jobs,
  allow_share_links,
  allow_public_showcase,
  allow_share_campaigns,
  allow_delivery_workspaces,
  allow_external_batch_reviews,
  watermark_exports,
  allow_manual_invoice,
  allow_overage,
  monthly_overage_cap_usd,
  concept_run_overage_usd,
  preview_generation_overage_usd,
  render_batch_overage_usd,
  storage_gb_month_overage_usd,
  internal_total_cost_ceiling_usd,
  internal_openai_cost_ceiling_usd,
  internal_runway_cost_ceiling_usd,
  sort_order
)
values
  (
    'free',
    'Free',
    0,
    1,
    1,
    12,
    1,
    2,
    2147483648,
    1,
    1,
    true,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    0,
    0,
    0,
    0,
    0,
    12,
    6,
    6,
    0
  ),
  (
    'starter',
    'Starter',
    39,
    3,
    4,
    40,
    4,
    8,
    21474836480,
    1,
    1,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    true,
    30,
    8,
    0.35,
    14,
    0.20,
    60,
    25,
    35,
    1
  ),
  (
    'growth',
    'Growth',
    99,
    10,
    12,
    120,
    12,
    24,
    107374182400,
    2,
    2,
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    true,
    100,
    7,
    0.30,
    12,
    0.18,
    180,
    70,
    110,
    2
  ),
  (
    'scale',
    'Scale',
    299,
    30,
    40,
    400,
    40,
    80,
    536870912000,
    3,
    3,
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    400,
    6,
    0.25,
    10,
    0.15,
    600,
    220,
    380,
    3
  )
on conflict (code) do update
set
  display_name = excluded.display_name,
  monthly_price_usd = excluded.monthly_price_usd,
  included_active_projects = excluded.included_active_projects,
  included_concept_runs = excluded.included_concept_runs,
  included_preview_generations = excluded.included_preview_generations,
  included_render_batches = excluded.included_render_batches,
  included_final_exports = excluded.included_final_exports,
  included_storage_bytes = excluded.included_storage_bytes,
  max_concurrent_preview_jobs = excluded.max_concurrent_preview_jobs,
  max_concurrent_render_jobs = excluded.max_concurrent_render_jobs,
  allow_share_links = excluded.allow_share_links,
  allow_public_showcase = excluded.allow_public_showcase,
  allow_share_campaigns = excluded.allow_share_campaigns,
  allow_delivery_workspaces = excluded.allow_delivery_workspaces,
  allow_external_batch_reviews = excluded.allow_external_batch_reviews,
  watermark_exports = excluded.watermark_exports,
  allow_manual_invoice = excluded.allow_manual_invoice,
  allow_overage = excluded.allow_overage,
  monthly_overage_cap_usd = excluded.monthly_overage_cap_usd,
  concept_run_overage_usd = excluded.concept_run_overage_usd,
  preview_generation_overage_usd = excluded.preview_generation_overage_usd,
  render_batch_overage_usd = excluded.render_batch_overage_usd,
  storage_gb_month_overage_usd = excluded.storage_gb_month_overage_usd,
  internal_total_cost_ceiling_usd = excluded.internal_total_cost_ceiling_usd,
  internal_openai_cost_ceiling_usd = excluded.internal_openai_cost_ceiling_usd,
  internal_runway_cost_ceiling_usd = excluded.internal_runway_cost_ceiling_usd,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.owner_billing_accounts (owner_id)
select p.id
from public.profiles p
on conflict (owner_id) do nothing;

insert into public.owner_subscriptions (
  owner_id,
  plan_code,
  provider,
  status,
  current_period_start,
  current_period_end,
  overage_cap_usd
)
select
  p.id,
  'free',
  'system',
  'free',
  date_trunc('month', timezone('utc', now())),
  date_trunc('month', timezone('utc', now())) + interval '1 month',
  0
from public.profiles p
on conflict (owner_id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  insert into public.owner_billing_accounts (owner_id)
  values (new.id)
  on conflict (owner_id) do nothing;

  insert into public.owner_subscriptions (
    owner_id,
    plan_code,
    provider,
    status,
    current_period_start,
    current_period_end,
    overage_cap_usd
  )
  values (
    new.id,
    'free',
    'system',
    'free',
    date_trunc('month', timezone('utc', now())),
    date_trunc('month', timezone('utc', now())) + interval '1 month',
    0
  )
  on conflict (owner_id) do nothing;

  return new;
end;
$$;
