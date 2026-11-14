-- ============================================================================
-- 1. Counsellors may not add leads. Only admins (and HR, through hr_leads_insert) can.
-- 2. Payment rules
--      fee below 20,000         pay in full
--      fee 20,000 or above      pay in full, OR 30% first and the other 70% within 10 days
--    create_enrollment() builds the two installments itself (nothing sent by the client is trusted),
--    and apply_payment() starts the 10 day clock when the first installment is paid.
-- Run once, whole file, in the Supabase SQL editor.
-- ============================================================================

-- 1. leads: drop the counsellor branch of the insert policy ------------------
drop policy if exists leads_insert on public.student_leads;
create policy leads_insert on public.student_leads for insert to authenticated
  with check (public.is_admin());

-- 2a. enrolment: full, or a 30% / 70% split for fees of 20,000 and up ---------
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
  v_total numeric(12,2); v_enrollment public.enrollments; v_first numeric(12,2);
begin
  if not public.is_staff() then raise exception 'only staff can create enrolments'; end if;

  select coalesce(p_total_amount, price) into v_total from public.courses where id = p_course_id;
  if v_total is null then raise exception 'course % not found', p_course_id; end if;

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
    -- the balance is provisionally due in 10 days; apply_payment() moves it to 10 days after the first payment
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

-- 2b. paying the first installment starts the 10 day clock on the balance -----
create or replace function public.apply_payment(
  p_payment_id uuid, p_provider_payment_id text default null, p_method text default null
)
returns public.payments language plpgsql security definer set search_path = public as $$
declare v_payment public.payments; v_inst public.installments;
begin
  if auth.role() = 'authenticated' and not public.is_admin() then
    raise exception 'only admins can verify payments';
  end if;

  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then raise exception 'payment % not found', p_payment_id; end if;
  if v_payment.status = 'success' then return v_payment; end if;  -- idempotent

  update public.payments
  set status = 'success',
      paid_at = coalesce(paid_at, now()),
      provider_payment_id = coalesce(p_provider_payment_id, provider_payment_id),
      method = coalesce(p_method, method)
  where id = p_payment_id
  returning * into v_payment;

  if v_payment.installment_id is not null then
    update public.installments set status = 'paid', paid_at = now()
    where id = v_payment.installment_id
    returning * into v_inst;

    -- first installment paid: the balance is due 10 days from today
    if v_inst.seq = 1 then
      update public.installments
      set due_date = current_date + 10
      where enrollment_id = v_inst.enrollment_id and seq = 2 and status <> 'paid';
    end if;
  end if;

  if v_payment.enrollment_id is not null then
    perform public.recalc_enrollment(v_payment.enrollment_id);
  end if;

  insert into public.audit_logs (actor_id, entity_type, entity_id, action, after)
  values (v_payment.created_by, 'payment', v_payment.id, 'payment_success', to_jsonb(v_payment));

  return v_payment;
end;
$$;

-- 2c. courses: installments follow the price automatically ---------------------
update public.courses set allows_partial = (price >= 20000), min_first_payment = null;

notify pgrst, 'reload schema';

-- verify (read-only): expect leads_insert to mention is_admin() only
select policyname, with_check from pg_policies
where schemaname = 'public' and tablename = 'student_leads' and cmd = 'INSERT' order by 1;
