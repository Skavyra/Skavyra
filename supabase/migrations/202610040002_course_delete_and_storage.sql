begin;

-- Repair course read/delete access even if the original admin FOR ALL policy
-- was omitted during setup. Existing enrollments retain their RESTRICT FK.
grant select, delete on public.courses, public.course_modules, public.lessons, public.lesson_resources to authenticated;
alter table public.courses enable row level security;
drop policy if exists courses_admin_select on public.courses;
create policy courses_admin_select on public.courses for select to authenticated using (public.is_admin());
drop policy if exists courses_admin_delete on public.courses;
create policy courses_admin_delete on public.courses for delete to authenticated using (public.is_admin());
drop policy if exists modules_admin_delete on public.course_modules;
create policy modules_admin_delete on public.course_modules for delete to authenticated using (public.is_admin());
drop policy if exists lessons_admin_delete on public.lessons;
create policy lessons_admin_delete on public.lessons for delete to authenticated using (public.is_admin());
drop policy if exists lesson_resources_admin_delete on public.lesson_resources;
create policy lesson_resources_admin_delete on public.lesson_resources for delete to authenticated using (public.is_admin());

-- Only a published lesson explicitly marked as a preview can be signed by a
-- visitor. Paid lessons and supplemental resources keep their existing rules.
drop policy if exists storage_published_lesson_previews on storage.objects;
create policy storage_published_lesson_previews on storage.objects for select to anon, authenticated
  using (
    bucket_id in ('course-videos', 'lesson-resources') and exists (
      select 1 from public.lessons l
      join public.course_modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      where l.storage_path = storage.objects.name
        and l.is_preview and l.is_published and c.status = 'published'
        and storage.objects.bucket_id = case when l.lesson_type = 'video' then 'course-videos' else 'lesson-resources' end
    )
  );

notify pgrst, 'reload schema';
commit;
