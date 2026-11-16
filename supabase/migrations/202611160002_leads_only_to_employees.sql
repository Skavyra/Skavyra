-- ============================================================================
-- A lead can only be given to someone who can work it: an employee (or an admin). HR-only accounts are refused,
-- whichever way the lead is assigned (bulk assign, import, single change). The screens already hide HR from the
-- lists; this makes the database enforce it too. Run once.
-- ============================================================================

create or replace function public.guard_lead_assignment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.assigned_employee_id is distinct from old.assigned_employee_id then
    if not public.can_manage_hr() then
      raise exception 'only an admin or HR can reassign a lead';
    end if;

    if new.assigned_employee_id is not null
       and not (public.has_role(new.assigned_employee_id, 'employee') or public.has_role(new.assigned_employee_id, 'admin')) then
      raise exception 'leads can only be given to an employee';
    end if;
  end if;
  return new;
end;
$$;

-- check (read-only): leads currently held by someone who is neither employee nor admin; expect 0 rows
select sl.id, sl.full_name, sl.assigned_employee_id
from public.student_leads sl
where sl.assigned_employee_id is not null and sl.deleted_at is null
  and not (public.has_role(sl.assigned_employee_id, 'employee') or public.has_role(sl.assigned_employee_id, 'admin'));
