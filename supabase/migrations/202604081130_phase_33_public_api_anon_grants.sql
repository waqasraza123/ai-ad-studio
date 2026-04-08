-- Align public API grants with existing public-read RLS policies for showcase,
-- promotion, delivery, and billing marketing surfaces.

grant usage on schema public to anon, authenticated, service_role;

-- Keep a single canonical published-showcase public policy name.
drop policy if exists "showcase_items_select_published_public" on public.showcase_items;

grant select on table public.showcase_items to anon;
grant select on table public.showcase_items to authenticated;

grant select on table public.share_campaigns to anon;
grant select on table public.share_campaigns to authenticated;

grant select on table public.delivery_workspaces to anon;
grant select on table public.delivery_workspaces to authenticated;

grant select on table public.delivery_workspace_exports to anon;
grant select on table public.delivery_workspace_exports to authenticated;

grant select on table public.exports to anon;
grant select on table public.exports to authenticated;

grant select on table public.assets to anon;
grant select on table public.assets to authenticated;

grant select on table public.billing_plans to anon;
grant select on table public.billing_plans to authenticated;
