alter table public.exports
  add column if not exists aspect_ratio text not null default '9:16',
  add column if not exists platform_preset text not null default 'default';
