create table if not exists public.showcase_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  export_id uuid not null references public.exports (id) on delete cascade,
  title text not null,
  summary text not null,
  preview_data_url text,
  aspect_ratio text not null,
  platform_preset text not null,
  template_name text,
  template_style_key text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (export_id)
);

create index if not exists showcase_items_owner_created_at_idx
  on public.showcase_items (owner_id, created_at desc);

create index if not exists showcase_items_published_sort_idx
  on public.showcase_items (is_published, sort_order asc, created_at desc);

alter table public.showcase_items enable row level security;

drop policy if exists "showcase_items_select_own" on public.showcase_items;
create policy "showcase_items_select_own"
on public.showcase_items
for select
using (auth.uid() = owner_id);

drop policy if exists "showcase_items_public_select_published" on public.showcase_items;
create policy "showcase_items_public_select_published"
on public.showcase_items
for select
using (is_published = true);

drop policy if exists "showcase_items_insert_own" on public.showcase_items;
create policy "showcase_items_insert_own"
on public.showcase_items
for insert
with check (auth.uid() = owner_id);

drop policy if exists "showcase_items_update_own" on public.showcase_items;
create policy "showcase_items_update_own"
on public.showcase_items
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "showcase_items_delete_own" on public.showcase_items;
create policy "showcase_items_delete_own"
on public.showcase_items
for delete
using (auth.uid() = owner_id);
