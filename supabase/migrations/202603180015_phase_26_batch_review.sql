alter table public.render_batches
  add column if not exists winner_export_id uuid references public.exports (id) on delete set null,
  add column if not exists review_note text,
  add column if not exists decided_at timestamptz;

create index if not exists render_batches_winner_export_idx
  on public.render_batches (winner_export_id);
