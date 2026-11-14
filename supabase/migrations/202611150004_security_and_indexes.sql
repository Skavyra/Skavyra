-- ============================================================================
-- Security hardening and database indexes. Run once, whole file, in the SQL editor.
--
--  1. Staff-only functions can no longer be called by signed-out visitors, and trigger functions can't be
--     called as functions at all. (The small helpers that row-level-security policies use, such as is_admin(),
--     stay callable, because the public course pages evaluate those policies for visitors.)
--  2. Only an admin may enrol a student at a price other than the course price.
--  3. Fixed search_path on four helper functions.
--  4. Indexes for the screens and reports that filter, sort and search.
-- ============================================================================

-- 1. who may execute what ------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in (
      'assign_leads', 'unassign_leads', 'import_leads', 'import_leads_assigned', 'import_offer_letters',
      'create_enrollment', 'issue_certificate', 'find_lead_owner', 'remove_employee', 'apply_payment'
    )
  loop
    execute format('revoke execute on function %s from public, anon', r.sig);
    execute format('grant execute on function %s to authenticated, service_role', r.sig);
  end loop;

  -- trigger functions are fired by the database, never called
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('guard_lead_assignment', 'guard_profile_flags', 'handle_new_user', 'log_lead_activity')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', r.sig);
  end loop;

  -- 3. fixed search_path
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('next_letter_no', 'set_letter_no', 'normalize_phone', 'set_updated_at')
  loop
    execute format('alter function %s set search_path = public', r.sig);
  end loop;
end $$;

-- 2. only an admin may change the fee ------------------------------------------
create or replace function public.create_enrollment(
  p_user_id uuid,
  p_course_id uuid,
  p_plan public.payment_plan default 'full',
  p_total_amount numeric default null,
  p_installments jsonb default '[]'::jsonb,   -- kept so older callers still match; ignored
  p_lead_id uuid default null,
  p_source text default 'admin'
)
returns public.enrollments language plpgsql security definer set search_path = public as $$
declare
  v_price numeric(12,2); v_total numeric(12,2); v_enrollment public.enrollments; v_first numeric(12,2);
begin
  if not public.is_staff() then raise exception 'only staff can create enrolments'; end if;

  select price into v_price from public.courses where id = p_course_id;
  if v_price is null then raise exception 'course % not found', p_course_id; end if;

  v_total := coalesce(p_total_amount, v_price);
  if v_total <> v_price and not public.is_admin() then
    raise exception 'only an admin can change a course fee';
  end if;

  if p_plan = 'partial' then
    if v_total < 20000 then
      raise exception 'fees below 20,000 must be paid in full';
    end if;
    v_first := round(v_total * 0.30, 2);
  end if;

  insert into public.enrollments (user_id, course_id, lead_id, enrolled_by, source, plan, total_amount)
  values (p_user_id, p_course_id, p_lead_id, auth.uid(), p_source, p_plan, v_total)
  returning * into v_enrollment;

  if p_plan = 'partial' then
    insert into public.installments (enrollment_id, seq, label, amount, due_date) values
      (v_enrollment.id, 1, 'Initial payment (30%)', v_first, current_date),
      (v_enrollment.id, 2, 'Balance (70%)', v_total - v_first, current_date + 10);
  end if;

  if p_lead_id is not null then
    update public.student_leads
    set converted_enrollment_id = v_enrollment.id, status = 'enrolled', completed_at = now()
    where id = p_lead_id;
  end if;

  insert into public.audit_logs (actor_id, entity_type, entity_id, action, after)
  values (auth.uid(), 'enrollment', v_enrollment.id, 'enrollment_created', to_jsonb(v_enrollment));

  return v_enrollment;
end;
$$;

revoke execute on function public.create_enrollment(uuid, uuid, public.payment_plan, numeric, jsonb, uuid, text) from public, anon;
grant execute on function public.create_enrollment(uuid, uuid, public.payment_plan, numeric, jsonb, uuid, text) to authenticated, service_role;

-- 4. indexes ---------------------------------------------------------------------
create index if not exists student_leads_batch_idx        on public.student_leads (batch_id) where batch_id is not null;
create index if not exists student_leads_created_idx      on public.student_leads (created_at desc) where deleted_at is null;
create index if not exists student_leads_unassigned_idx   on public.student_leads (created_at desc) where assigned_employee_id is null and deleted_at is null;
create index if not exists student_leads_status_idx       on public.student_leads (status) where deleted_at is null;
create index if not exists student_leads_created_by_idx   on public.student_leads (created_by);

create index if not exists lead_activities_actor_idx      on public.lead_activities (actor_id, created_at desc);
create index if not exists lead_activities_created_idx    on public.lead_activities (created_at);

create index if not exists payments_status_created_idx    on public.payments (status, created_at desc);
create index if not exists payments_user_idx              on public.payments (user_id);

create index if not exists enrollments_lead_idx           on public.enrollments (lead_id) where lead_id is not null;
create index if not exists enrollments_enrolled_by_idx    on public.enrollments (enrolled_by);
create index if not exists enrollments_created_idx        on public.enrollments (created_at desc);

create index if not exists installments_due_idx           on public.installments (due_date) where status = 'pending';
create index if not exists lead_courses_course_idx        on public.lead_courses (course_id);
create index if not exists audit_logs_actor_idx           on public.audit_logs (actor_id, created_at desc);
create index if not exists progress_enrollment_idx        on public.progress (enrollment_id);
create index if not exists lead_upload_batches_created_idx on public.lead_upload_batches (created_at desc);
create index if not exists user_roles_role_idx            on public.user_roles (role, user_id);

-- user_roles(user_id, role) is already unique, so it serves every lookup this one did
drop index if exists public.user_roles_user_idx;

-- search boxes use ilike '%text%', which a normal index cannot help; trigram indexes can
do $$
declare s text; c text;
begin
  select n.nspname into s from pg_extension e join pg_namespace n on n.oid = e.extnamespace where e.extname = 'pg_trgm';
  if s is null then
    create extension if not exists pg_trgm with schema extensions;
    s := 'extensions';
  end if;
  foreach c in array array['full_name', 'phone', 'college_name', 'email'] loop
    begin
      execute format('create index if not exists student_leads_%s_trgm on public.student_leads using gin (%I %I.gin_trgm_ops) where deleted_at is null', c, c, s);
    exception when others then
      raise notice 'skipped trigram index on %: %', c, sqlerrm;
    end;
  end loop;
end $$;

analyze public.student_leads;
analyze public.payments;
analyze public.enrollments;
analyze public.lead_activities;

notify pgrst, 'reload schema';

-- verify (read-only): signed-out visitors should only be able to run the helpers and the two public functions
select p.proname
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef and has_function_privilege('anon', p.oid, 'execute')
order by 1;
