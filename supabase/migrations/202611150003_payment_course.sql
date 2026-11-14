-- A logged payment now says which course it is for, so the amount can be checked against that course's fee
-- (full, the first 30%, or the 70% balance) and so reports can total money per course. Run once.
alter table public.payments
  add column if not exists course_id uuid references public.courses(id) on delete set null;

create index if not exists payments_course_idx on public.payments (course_id);

notify pgrst, 'reload schema';

select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'payments' and column_name = 'course_id';   -- expect 1 row
