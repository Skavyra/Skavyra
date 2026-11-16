-- ============================================================================
-- Frees the email of employees who were removed BEFORE the app started doing it automatically.
-- From now on, removing an employee releases their email at the same moment (deactivate-staff function,
-- action release_login). This file only cleans up the people who were removed earlier.
--
-- It changes only logins that hold no role at all AND have an "employee_removed" entry in the audit log, so a
-- student or anyone still in use is never touched. The old email is kept in the audit log.
-- Step 1 shows who would change. Step 2 does it. Run step 1 first, check the list, then run step 2.
-- ============================================================================

-- STEP 1: preview (read-only)
select u.id, u.email as email_that_will_be_freed
from auth.users u
where not exists (select 1 from public.user_roles r where r.user_id = u.id)
  and exists (select 1 from public.audit_logs a where a.entity_id = u.id and a.action = 'employee_removed')
  and u.email not like '%@removed.invalid';

-- STEP 2: free them
with targets as (
  select u.id, u.email as old_email
  from auth.users u
  where not exists (select 1 from public.user_roles r where r.user_id = u.id)
    and exists (select 1 from public.audit_logs a where a.entity_id = u.id and a.action = 'employee_removed')
    and u.email not like '%@removed.invalid'
), logged as (
  insert into public.audit_logs (actor_id, entity_type, entity_id, action, after)
  select null, 'user', id, 'login_released', jsonb_build_object('previous_email', old_email) from targets
  returning entity_id
), prof as (
  update public.profiles p set email = 'removed-' || p.id || '@removed.invalid'
  from targets t where p.id = t.id
  returning p.id
)
update auth.users u
set email = 'removed-' || u.id || '@removed.invalid',
    banned_until = now() + interval '100 years'
from targets t
where u.id = t.id;

-- verify: should now be empty
select u.email from auth.users u
where not exists (select 1 from public.user_roles r where r.user_id = u.id)
  and exists (select 1 from public.audit_logs a where a.entity_id = u.id and a.action = 'employee_removed')
  and u.email not like '%@removed.invalid';
