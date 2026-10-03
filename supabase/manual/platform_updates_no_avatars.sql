BEGIN;

-- =========================================================
-- 1. Optional course-page content
-- =========================================================

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS learning_outcomes text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS prerequisites text,
  ADD COLUMN IF NOT EXISTS projects text,
  ADD COLUMN IF NOT EXISTS mentor_bio text;


-- =========================================================
-- 2. Admin course deletion permissions
-- Existing enrollment foreign-key protections remain intact.
-- =========================================================

GRANT SELECT, DELETE
ON public.courses,
   public.course_modules,
   public.lessons,
   public.lesson_resources
TO authenticated;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS courses_admin_select ON public.courses;

CREATE POLICY courses_admin_select
ON public.courses
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS courses_admin_delete ON public.courses;

CREATE POLICY courses_admin_delete
ON public.courses
FOR DELETE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS modules_admin_delete ON public.course_modules;

CREATE POLICY modules_admin_delete
ON public.course_modules
FOR DELETE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS lessons_admin_delete ON public.lessons;

CREATE POLICY lessons_admin_delete
ON public.lessons
FOR DELETE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS lesson_resources_admin_delete
ON public.lesson_resources;

CREATE POLICY lesson_resources_admin_delete
ON public.lesson_resources
FOR DELETE
TO authenticated
USING (public.is_admin());


-- =========================================================
-- 3. Disable the retired profile-avatar feature
-- Existing files remain stored; no new avatar bucket is created.
-- =========================================================

DROP POLICY IF EXISTS avatars_public_read ON storage.objects;
DROP POLICY IF EXISTS avatars_owner_insert ON storage.objects;
DROP POLICY IF EXISTS avatars_owner_update ON storage.objects;
DROP POLICY IF EXISTS avatars_owner_delete ON storage.objects;

UPDATE storage.buckets
SET public = false
WHERE id = 'avatars';


-- =========================================================
-- 4. Storage access for published preview lessons
-- Other lesson files retain their existing access policies.
-- =========================================================

DROP POLICY IF EXISTS storage_published_lesson_previews
ON storage.objects;

CREATE POLICY storage_published_lesson_previews
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id IN ('course-videos', 'lesson-resources')
  AND EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.course_modules m
      ON m.id = l.module_id
    JOIN public.courses c
      ON c.id = m.course_id
    WHERE l.storage_path = storage.objects.name
      AND l.is_preview
      AND l.is_published
      AND c.status = 'published'
      AND storage.objects.bucket_id = CASE
        WHEN l.lesson_type = 'video' THEN 'course-videos'
        ELSE 'lesson-resources'
      END
  )
);


-- =========================================================
-- 5. Admin employee removal
-- Removes the staff record and employee role.
-- Preserves login, profile, other roles, and history.
-- Reassigns open leads or leaves them unassigned.
-- =========================================================

CREATE OR REPLACE FUNCTION public.remove_employee(
  p_user_id uuid,
  p_reassign_to uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_before jsonb;
  v_moved integer := 0;
BEGIN
  IF v_actor IS NULL
     OR NOT public.is_admin()
     OR NOT EXISTS (
       SELECT 1
       FROM public.profiles
       WHERE id = v_actor
         AND is_active
     )
  THEN
    RAISE EXCEPTION 'Only active admins can remove employees';
  END IF;

  IF p_user_id = v_actor THEN
    RAISE EXCEPTION 'You cannot remove your own account';
  END IF;

  PERFORM 1
  FROM auth.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF public.has_role(p_user_id, 'admin') THEN
    RAISE EXCEPTION 'Admin accounts cannot be removed here';
  END IF;

  SELECT to_jsonb(e)
  INTO v_before
  FROM public.employees e
  WHERE e.id = p_user_id
  FOR UPDATE;

  IF v_before IS NULL THEN
    RAISE EXCEPTION 'Employee not found';
  END IF;

  IF p_reassign_to IS NOT NULL THEN
    IF p_reassign_to = p_user_id THEN
      RAISE EXCEPTION 'Choose a different employee';
    END IF;

    PERFORM 1
    FROM public.employees e
    JOIN public.profiles p ON p.id = e.id
    WHERE e.id = p_reassign_to
      AND e.is_active
      AND p.is_active
      AND (
        public.has_role(e.id, 'employee')
        OR public.has_role(e.id, 'admin')
      )
    FOR SHARE OF e, p;

    IF NOT FOUND THEN
      RAISE EXCEPTION
        'Choose an active employee to receive the leads';
    END IF;
  END IF;

  UPDATE public.student_leads
  SET
    assigned_employee_id = p_reassign_to,
    assigned_by = v_actor,
    assigned_at = now()
  WHERE assigned_employee_id = p_user_id
    AND deleted_at IS NULL
    AND status NOT IN (
      'enrolled',
      'not_interested',
      'invalid_contact'
    );

  GET DIAGNOSTICS v_moved = ROW_COUNT;

  DELETE FROM public.user_roles
  WHERE user_id = p_user_id
    AND role = 'employee';

  DELETE FROM public.employees
  WHERE id = p_user_id;

  INSERT INTO public.audit_logs (
    actor_id,
    entity_type,
    entity_id,
    action,
    before,
    after
  )
  VALUES (
    v_actor,
    'employee',
    p_user_id,
    'employee_removed',
    v_before,
    jsonb_build_object(
      'reassigned_to', p_reassign_to,
      'leads_moved', v_moved
    )
  );

  RETURN jsonb_build_object('leads_moved', v_moved);
END;
$$;

REVOKE ALL
ON FUNCTION public.remove_employee(uuid, uuid)
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.remove_employee(uuid, uuid)
TO authenticated;


-- =========================================================
-- 6. Refresh the API schema and finish
-- =========================================================

NOTIFY pgrst, 'reload schema';

COMMIT;

SELECT 'Platform updates applied successfully (profile avatars disabled)' AS result;