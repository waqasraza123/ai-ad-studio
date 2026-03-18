alter table public.concepts
  add column if not exists risk_flags jsonb not null default '[]'::jsonb,
  add column if not exists safety_notes text,
  add column if not exists was_safety_modified boolean not null default false;

alter table public.exports
  add column if not exists variant_key text not null default 'default',
  add column if not exists render_metadata jsonb not null default '{}'::jsonb;
