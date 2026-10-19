alter table public.courses
  add column if not exists is_flagship boolean not null default false,
  add column if not exists offer_label text,
  add column if not exists offer_price numeric,
  add column if not exists offer_ends_at timestamptz,
  add column if not exists show_countdown boolean not null default false,
  add column if not exists tools text[] not null default '{}';
notify pgrst, 'reload schema';
