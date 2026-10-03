-- Read-only: run in the Supabase SQL editor to inspect the deployed state.
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where (schemaname = 'public' and tablename in ('courses', 'course_modules', 'lessons', 'lesson_resources', 'employees', 'user_roles'))
   or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('course-covers', 'brand', 'avatars', 'course-videos', 'lesson-resources', 'payment-proofs', 'offer-letters', 'certificates')
order by id;

select table_name, privilege_type from information_schema.role_table_grants
where grantee = 'authenticated' and table_schema = 'public'
  and table_name in ('courses', 'employees', 'course_modules', 'lessons', 'lesson_resources')
order by table_name, privilege_type;

select conname, pg_get_constraintdef(oid) as definition from pg_constraint
where conrelid = 'public.enrollments'::regclass and contype = 'f';
