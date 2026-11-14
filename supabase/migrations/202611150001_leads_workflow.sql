-- ============================================================================
-- Leads workflow: staged import + assign in one step, bulk unassign, HR add-lead
--
--   import_leads_assigned()  import a checked file AND hand the leads out in one
--                            transaction. p_plan = [{employee_id, phones:[...]}].
--                            Phones not in the plan stay unassigned.
--   unassign_leads()         put leads back to "unassigned" (admin + HR), audited.
--   hr_leads_insert policy   lets HR add a single lead (always unassigned).
-- ============================================================================

create or replace function public.import_leads_assigned(
  p_file_name text, p_file_type upload_file_type, p_column_mapping jsonb,
  p_detected_columns text[], p_rows jsonb, p_plan jsonb default '[]'::jsonb
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v jsonb; v_batch uuid; v_entry jsonb; v_emp uuid; v_phones text[];
  v_assigned int := 0; v_n int;
begin
  if not public.can_manage_hr() then
    raise exception 'only admins and HR can import leads';
  end if;

  -- check every counsellor before anything is written
  for v_entry in select * from jsonb_array_elements(coalesce(p_plan, '[]'::jsonb)) loop
    v_emp := (v_entry->>'employee_id')::uuid;
    perform 1 from public.employees e join public.profiles p on p.id = e.id
    where e.id = v_emp and e.is_active and p.is_active;
    if not found then raise exception 'choose active counsellors only'; end if;
  end loop;

  v := public.import_leads(p_file_name, p_file_type, p_column_mapping, p_detected_columns, p_rows);
  v_batch := (v->>'batch_id')::uuid;

  for v_entry in select * from jsonb_array_elements(coalesce(p_plan, '[]'::jsonb)) loop
    v_emp := (v_entry->>'employee_id')::uuid;
    select coalesce(array_agg(public.normalize_phone(x)), '{}') into v_phones
    from jsonb_array_elements_text(v_entry->'phones') x;

    update public.student_leads
    set assigned_employee_id = v_emp, assigned_by = auth.uid(), assigned_at = now()
    where batch_id = v_batch and phone = any(v_phones)
      and assigned_employee_id is null and deleted_at is null;
    get diagnostics v_n = row_count;
    v_assigned := v_assigned + v_n;
  end loop;

  insert into public.audit_logs (actor_id, entity_type, entity_id, action, after)
  values (auth.uid(), 'lead_batch', v_batch, 'leads_assigned_on_import',
          jsonb_build_object('assigned', v_assigned));

  return v || jsonb_build_object('assigned', v_assigned);
end;
$$;

create or replace function public.unassign_leads(p_lead_ids uuid[])
returns integer language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  if not public.can_manage_hr() then
    raise exception 'only admins and HR can unassign leads';
  end if;

  update public.student_leads
  set assigned_employee_id = null, assigned_by = null, assigned_at = null
  where id = any(p_lead_ids) and deleted_at is null and assigned_employee_id is not null;
  get diagnostics v_count = row_count;

  insert into public.audit_logs (actor_id, entity_type, action, after)
  values (auth.uid(), 'lead', 'leads_unassigned', jsonb_build_object('leads', v_count));

  return v_count;
end;
$$;

revoke all on function public.import_leads_assigned(text, upload_file_type, jsonb, text[], jsonb, jsonb) from public, anon;
grant execute on function public.import_leads_assigned(text, upload_file_type, jsonb, text[], jsonb, jsonb) to authenticated;
revoke all on function public.unassign_leads(uuid[]) from public, anon;
grant execute on function public.unassign_leads(uuid[]) to authenticated;

-- HR may add a lead of their own, always unassigned (admins and employees already can).
drop policy if exists hr_leads_insert on public.student_leads;
create policy hr_leads_insert on public.student_leads for insert
  with check (is_hr() and created_by = auth.uid() and assigned_employee_id is null);

select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and proname in ('import_leads_assigned','unassign_leads') order by 1;
