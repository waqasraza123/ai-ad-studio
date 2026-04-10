-- Repair the phase-34 billing-plan capability columns for environments that
-- drifted before the activation/feedback billing flags were applied.

alter table public.billing_plans
  add column if not exists allow_activation_packages boolean not null default false,
  add column if not exists allow_creative_performance_ingestion boolean not null default false,
  add column if not exists allow_creative_performance_analytics boolean not null default false;

update public.billing_plans
set
  allow_activation_packages = case
    when code = 'free' then false
    when code in ('starter', 'growth', 'scale') then true
    else allow_activation_packages
  end,
  allow_creative_performance_ingestion = case
    when code = 'free' then false
    when code in ('starter', 'growth', 'scale') then true
    else allow_creative_performance_ingestion
  end,
  allow_creative_performance_analytics = case
    when code = 'free' then false
    when code in ('starter', 'growth', 'scale') then true
    else allow_creative_performance_analytics
  end
where code in ('free', 'starter', 'growth', 'scale');
