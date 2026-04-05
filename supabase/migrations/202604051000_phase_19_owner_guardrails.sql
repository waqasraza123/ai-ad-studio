create table if not exists public.owner_guardrails (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  monthly_total_budget_usd numeric(10, 2) not null default 200,
  monthly_openai_budget_usd numeric(10, 2) not null default 75,
  monthly_runway_budget_usd numeric(10, 2) not null default 75,
  max_concurrent_render_jobs integer not null default 2,
  max_concurrent_preview_jobs integer not null default 3,
  auto_block_on_budget boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint owner_guardrails_monthly_total_budget_nonnegative_check
    check (monthly_total_budget_usd >= 0),
  constraint owner_guardrails_monthly_openai_budget_nonnegative_check
    check (monthly_openai_budget_usd >= 0),
  constraint owner_guardrails_monthly_runway_budget_nonnegative_check
    check (monthly_runway_budget_usd >= 0),
  constraint owner_guardrails_max_concurrent_render_jobs_positive_check
    check (max_concurrent_render_jobs > 0),
  constraint owner_guardrails_max_concurrent_preview_jobs_positive_check
    check (max_concurrent_preview_jobs > 0)
);

create trigger owner_guardrails_set_updated_at
before update on public.owner_guardrails
for each row
execute function public.set_updated_at();

alter table public.owner_guardrails enable row level security;

drop policy if exists "owner_guardrails_select_own" on public.owner_guardrails;
create policy "owner_guardrails_select_own"
on public.owner_guardrails
for select
using (auth.uid() = owner_id);

drop policy if exists "owner_guardrails_insert_own" on public.owner_guardrails;
create policy "owner_guardrails_insert_own"
on public.owner_guardrails
for insert
with check (auth.uid() = owner_id);

drop policy if exists "owner_guardrails_update_own" on public.owner_guardrails;
create policy "owner_guardrails_update_own"
on public.owner_guardrails
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "owner_guardrails_delete_own" on public.owner_guardrails;
create policy "owner_guardrails_delete_own"
on public.owner_guardrails
for delete
using (auth.uid() = owner_id);

grant select, insert, update, delete on table public.owner_guardrails to authenticated;
grant select, insert, update, delete on table public.owner_guardrails to service_role;

insert into public.owner_guardrails (
  owner_id
)
select p.id
from public.profiles p
on conflict (owner_id) do nothing;
