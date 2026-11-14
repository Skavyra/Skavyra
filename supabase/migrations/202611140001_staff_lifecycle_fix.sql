-- ============================================================================
-- Staff lifecycle fix: Deactivate and Reactivate for admin AND HR
-- NOT YET RUN. Run once, whole file, in the Supabase SQL editor.
--
-- WHAT WAS BROKEN
-- deactivate_staff() writes profiles.is_active. The guard_profile_flags trigger
-- refuses that unless is_admin() is true, and is_admin() reads auth.uid().
-- The deactivate-staff edge function calls the RPC with the service-role key,
-- where auth.uid() is NULL. So the guard refused EVERYONE: HR, and admins too.
-- Reactivate had the same trap for HR, and never lifted the auth ban that
-- "Also block them from logging in" sets.
--
-- WHAT THIS DOES
--   1. guard_profile_flags honours a transaction-local flag that only
--      deactivate_staff() and reactivate_staff() raise. Direct edits of
--      profiles.is_active by a non-admin session are still refused.
--   2. deactivate_staff(): same role checks as before, plus it now validates
--      the person who inherits the open leads (as remove_employee already did).
--   3. reactivate_staff(): new. Admin may reactivate anyone on staff, HR may
--      reactivate counsellors only. The edge function lifts the auth ban.
--
-- WHO MAY DO WHAT AFTER THIS RUNS
--   action       admin                  HR
--   -----------  ---------------------  -------------------
--   deactivate   anyone on staff        counsellors only
--   reactivate   anyone on staff        counsellors only
--   remove       counsellors and HR     counsellors only
--   (nobody can deactivate or remove themselves; nobody removes an admin here)
--
-- DEACTIVATE vs REMOVE
--   deactivate: switches access off. Reversible. Staff record, role and history
--               stay. Open leads can be handed over. Optional login ban.
--   remove:     deletes the staff record and the employee/hr role. Not
--               reversible from the UI. Login and profile survive, but with no
--               role the person lands on the public site. Open leads handed over.
-- remove_employee() is not touched by this file.
-- ============================================================================


-- 1. the guard ---------------------------------------------------------------
create or replace function public.guard_profile_flags()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_active is distinct from old.is_active
     and not public.is_admin()
     and coalesce(current_setting('app.allow_active_change', true), '') <> 'on' then
    raise exception 'is_active can only be changed by an admin';
  end if;
  return new;
end;
$$;


-- 2. deactivate --------------------------------------------------------------
create or replace function public.deactivate_staff(
  p_user_id uuid, p_actor_id uuid, p_reassign_to uuid default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_moved int := 0; v_actor_is_admin boolean;
begin
  if p_actor_id is null then raise exception 'no actor supplied'; end if;

  v_actor_is_admin := public.has_role(p_actor_id, 'admin');

  if not (v_actor_is_admin or public.has_role(p_actor_id, 'hr')) then
    raise exception 'only admins and HR can deactivate staff';
  end if;
  if p_user_id = p_actor_id then raise exception 'you cannot deactivate your own account'; end if;

  if not exists (select 1 from public.employees where id = p_user_id) then
    raise exception 'that person is not a staff member';
  end if;

  if not v_actor_is_admin
     and (public.has_role(p_user_id, 'admin') or public.has_role(p_user_id, 'hr')) then
    raise exception 'HR cannot deactivate an admin or another HR user';
  end if;

  if p_reassign_to is not null then
    if p_reassign_to = p_user_id then raise exception 'choose a different employee'; end if;
    perform 1
    from public.employees e join public.profiles p on p.id = e.id
    where e.id = p_reassign_to and e.is_active and p.is_active
      and (public.has_role(e.id, 'employee') or public.has_role(e.id, 'admin'));
    if not found then raise exception 'choose an active employee to receive the leads'; end if;
  end if;

  update public.employees set is_active = false, deactivated_at = now() where id = p_user_id;

  perform set_config('app.allow_active_change', 'on', true);   -- true = this transaction only
  update public.profiles set is_active = false where id = p_user_id;
  perform set_config('app.allow_active_change', 'off', true);

  if p_reassign_to is not null then
    update public.student_leads
    set assigned_employee_id = p_reassign_to, assigned_by = p_actor_id, assigned_at = now()
    where assigned_employee_id = p_user_id
      and deleted_at is null
      and status not in ('enrolled','not_interested','invalid_contact');
    get diagnostics v_moved = row_count;
  end if;

  insert into public.audit_logs (actor_id, entity_type, entity_id, action, after)
  values (p_actor_id, 'user', p_user_id, 'staff_deactivated',
          jsonb_build_object('reassigned_to', p_reassign_to, 'leads_moved', v_moved));

  return jsonb_build_object('user_id', p_user_id, 'leads_moved', v_moved);
end;
$$;


-- 3. reactivate --------------------------------------------------------------
create or replace function public.reactivate_staff(p_user_id uuid, p_actor_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_actor_is_admin boolean;
begin
  if p_actor_id is null then raise exception 'no actor supplied'; end if;

  v_actor_is_admin := public.has_role(p_actor_id, 'admin');

  if not (v_actor_is_admin or public.has_role(p_actor_id, 'hr')) then
    raise exception 'only admins and HR can reactivate staff';
  end if;

  if not exists (select 1 from public.employees where id = p_user_id) then
    raise exception 'that person is not a staff member';
  end if;

  if not v_actor_is_admin
     and (public.has_role(p_user_id, 'admin') or public.has_role(p_user_id, 'hr')) then
    raise exception 'HR cannot reactivate an admin or another HR user';
  end if;

  update public.employees set is_active = true, deactivated_at = null where id = p_user_id;

  perform set_config('app.allow_active_change', 'on', true);
  update public.profiles set is_active = true where id = p_user_id;
  perform set_config('app.allow_active_change', 'off', true);

  insert into public.audit_logs (actor_id, entity_type, entity_id, action)
  values (p_actor_id, 'user', p_user_id, 'staff_reactivated');

  return jsonb_build_object('user_id', p_user_id);
end;
$$;


-- 4. grants: service role only (reached through the deactivate-staff edge function)
revoke all on function public.deactivate_staff(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.deactivate_staff(uuid, uuid, uuid) to service_role;
revoke all on function public.reactivate_staff(uuid, uuid) from public, anon, authenticated;
grant execute on function public.reactivate_staff(uuid, uuid) to service_role;


-- 5. verify (read-only) ------------------------------------------------------
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and proname in ('deactivate_staff','reactivate_staff','guard_profile_flags')
order by proname;   -- expect 3 rows
