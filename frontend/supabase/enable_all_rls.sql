-- DEPRECATED: this file previously installed permissive policies that allowed
-- every authenticated account to mutate protected tables.
--
-- Do not use this script. Run migration_auth_rls_hardening.sql instead.
DO $$
BEGIN
  RAISE EXCEPTION 'Unsafe migration blocked. Run migration_auth_rls_hardening.sql instead.';
END $$;
