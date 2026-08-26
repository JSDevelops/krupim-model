-- FINE MODEL authentication and RLS hardening
-- Run once in the Supabase SQL editor after schema.sql.

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS school_name TEXT,
  ADD COLUMN IF NOT EXISTS requested_role user_role NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_approval_status_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_approval_status_check
      CHECK (approval_status IN ('pending', 'active', 'inactive'));
  END IF;
END $$;

UPDATE public.profiles p
SET email = COALESCE(p.email, u.email),
    requested_role = CASE
      WHEN p.role = 'teacher'::public.user_role THEN 'teacher'::public.user_role
      ELSE p.requested_role
    END
FROM auth.users u
WHERE u.id = p.id;

INSERT INTO public.profiles (id, name, email, role, requested_role, approval_status)
SELECT
  u.id,
  COALESCE(NULLIF(BTRIM(u.raw_user_meta_data->>'name'), ''), u.email, 'User'),
  u.email,
  'student'::public.user_role,
  'student'::public.user_role,
  'inactive'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT
  FROM public.profiles
  WHERE id = auth.uid() AND approval_status = 'active'
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested public.user_role;
BEGIN
  requested := CASE
    WHEN NEW.raw_user_meta_data->>'requested_role' = 'teacher' THEN 'teacher'::public.user_role
    ELSE 'student'::public.user_role
  END;

  INSERT INTO public.profiles (
    id, name, email, role, requested_role, approval_status, school_name
  ) VALUES (
    NEW.id,
    COALESCE(NULLIF(BTRIM(NEW.raw_user_meta_data->>'name'), ''), NEW.email, 'User'),
    NEW.email,
    'student'::public.user_role,
    requested,
    CASE WHEN requested = 'teacher'::public.user_role THEN 'pending' ELSE 'active' END,
    NULLIF(BTRIM(NEW.raw_user_meta_data->>'school_name'), '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Developers manage profiles" ON public.profiles;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Staff view profiles" ON public.profiles
  FOR SELECT USING (public.auth_user_role() IN ('teacher', 'developer'));
CREATE POLICY "Users update own safe profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Developers manage profiles" ON public.profiles
  FOR ALL USING (public.auth_user_role() = 'developer')
  WITH CHECK (public.auth_user_role() = 'developer');

-- A browser client can edit presentation fields only. Role and approval changes
-- must go through a service-role server endpoint.
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (name, avatar_url, phone, bio, school_name) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Allow authenticated read class_students" ON public.class_students;
DROP POLICY IF EXISTS "Students and teachers manage class_students" ON public.class_students;
DROP POLICY IF EXISTS "Members view class_students" ON public.class_students;
DROP POLICY IF EXISTS "Teachers manage class_students" ON public.class_students;

CREATE POLICY "Members view class_students" ON public.class_students
  FOR SELECT USING (
    student_id = auth.uid()
    OR public.auth_user_role() = 'developer'
    OR EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_id AND c.teacher_id = auth.uid()
    )
  );
CREATE POLICY "Teachers manage class_students" ON public.class_students
  FOR ALL USING (
    public.auth_user_role() = 'developer'
    OR EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_id AND c.teacher_id = auth.uid()
    )
  ) WITH CHECK (
    public.auth_user_role() = 'developer'
    OR EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_id AND c.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users manage ar_items" ON public.ar_items;
DROP POLICY IF EXISTS "Teachers manage ar_items" ON public.ar_items;
CREATE POLICY "Teachers manage ar_items" ON public.ar_items
  FOR ALL USING (
    public.auth_user_role() = 'developer'
    OR (public.auth_user_role() = 'teacher' AND created_by = auth.uid())
  ) WITH CHECK (
    public.auth_user_role() = 'developer'
    OR (public.auth_user_role() = 'teacher' AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users manage vocabulary_items" ON public.vocabulary_items;
DROP POLICY IF EXISTS "Public can manage vocabulary_items" ON public.vocabulary_items;
DROP POLICY IF EXISTS "Allow public insert update delete vocabulary_items" ON public.vocabulary_items;
DROP POLICY IF EXISTS "Teachers manage vocabulary_items" ON public.vocabulary_items;
CREATE POLICY "Teachers manage vocabulary_items" ON public.vocabulary_items
  FOR ALL USING (public.auth_user_role() IN ('teacher', 'developer'))
  WITH CHECK (public.auth_user_role() IN ('teacher', 'developer'));

DROP POLICY IF EXISTS "Teachers manage own lesson plans" ON public.fine_lesson_plans;
CREATE POLICY "Teachers manage own lesson plans" ON public.fine_lesson_plans
  FOR ALL USING (
    public.auth_user_role() = 'developer'
    OR (public.auth_user_role() = 'teacher' AND teacher_email = auth.jwt()->>'email')
  ) WITH CHECK (
    public.auth_user_role() = 'developer'
    OR (public.auth_user_role() = 'teacher' AND teacher_email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Teachers create class invites" ON public.class_invites;
DROP POLICY IF EXISTS "Teachers manage class invites" ON public.class_invites;
DROP POLICY IF EXISTS "Allow public read class_invites" ON public.class_invites;
CREATE POLICY "Teachers manage class invites" ON public.class_invites
  FOR ALL USING (public.auth_user_role() IN ('teacher', 'developer'))
  WITH CHECK (public.auth_user_role() IN ('teacher', 'developer'));

COMMIT;
