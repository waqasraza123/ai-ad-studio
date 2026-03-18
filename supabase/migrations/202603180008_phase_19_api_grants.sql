-- Enable Supabase Data API access for authenticated users.
-- RLS policies still enforce row-level access; these grants only allow the API roles to reach the tables.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.project_inputs to authenticated;
grant select, insert, update, delete on table public.assets to authenticated;
grant select, insert, update, delete on table public.concepts to authenticated;
grant select, insert, update, delete on table public.jobs to authenticated;
grant select, insert, update, delete on table public.exports to authenticated;
grant select, insert, update, delete on table public.share_links to authenticated;
grant select, insert, update, delete on table public.usage_events to authenticated;
grant select, insert, update, delete on table public.job_traces to authenticated;
grant select, insert, update, delete on table public.notifications to authenticated;

-- Ensure future tables in public are accessible to authenticated.
alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated;

