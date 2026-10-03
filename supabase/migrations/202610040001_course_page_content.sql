-- Optional public course content. Existing courses and access policies are preserved.
alter table public.courses
  add column if not exists learning_outcomes text,
  add column if not exists target_audience text,
  add column if not exists prerequisites text,
  add column if not exists projects text,
  add column if not exists mentor_bio text;

notify pgrst, 'reload schema';
