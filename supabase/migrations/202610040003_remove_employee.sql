begin;

-- Remove staff membership atomically; profile/auth rows remain for historical
-- references. Actor identity comes from the JWT, never a client-supplied id.
create or replace function public.remove_employee(p_user_id uuid, p_reassign_to uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_actor uuid := auth.uid();
  v_before jsonb;
  v_moved integer := 0;
begin
  if v_actor is null or not public.is_admin() or not exists (
    select 1 from public.profiles where id = v_actor and is_active
  ) then raise exception 'Only active admins can remove employees'; end if;
  if p_user_id = v_actor then raise exception 'You cannot remove your own account'; end if;

  -- Lock the parent account to serialize membership changes through this flow.
  perform 1 from auth.users where id = p_user_id for update;
  if public.has_role(p_user_id, 'admin') then raise exception 'Admin accounts cannot be removed here'; end if;
  select to_jsonb(e) into v_before from public.employees e where e.id = p_user_id for update;
  if v_before is null then raise exception 'Employee not found'; end if;

  if p_reassign_to is not null then
    if p_reassign_to = p_user_id then raise exception 'Choose a different employee'; end if;
    perform 1 from public.employees e join public.profiles p on p.id = e.id
      where e.id = p_reassign_to and e.is_active and p.is_active
        and (public.has_role(e.id, 'employee') or public.has_role(e.id, 'admin'))
      for share of e, p;
    if not found then raise exception 'Choose an active employee to receive the leads'; end if;
  end if;

  update public.student_leads
  set assigned_employee_id = p_reassign_to, assigned_by = v_actor, assigned_at = now()
  where assigned_employee_id = p_user_id and deleted_at is null
    and status not in ('enrolled', 'not_interested', 'invalid_contact');
  get diagnostics v_moved = row_count;

  delete from public.user_roles where user_id = p_user_id and role = 'employee';
  delete from public.employees where id = p_user_id;

  insert into public.audit_logs (actor_id, entity_type, entity_id, action, before, after)
  values (v_actor, 'employee', p_user_id, 'employee_removed', v_before,
    jsonb_build_object('reassigned_to', p_reassign_to, 'leads_moved', v_moved));
  return jsonb_build_object('leads_moved', v_moved);
end;
$$;
revoke all on function public.remove_employee(uuid, uuid) from public, anon;
grant execute on function public.remove_employee(uuid, uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
