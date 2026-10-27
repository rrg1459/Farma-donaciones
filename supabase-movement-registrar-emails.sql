DROP FUNCTION IF EXISTS public.get_movement_registrar_emails(UUID[]);

CREATE OR REPLACE FUNCTION public.get_movement_registrar_emails(
  p_user_ids UUID[]
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión para consultar los responsables.'
      USING ERRCODE = '28000';
  END IF;

  RETURN QUERY
  SELECT p.id, COALESCE(NULLIF(BTRIM(p.full_name), ''), p.email)
  FROM public.profiles AS p
  WHERE p.id = ANY(COALESCE(p_user_ids, ARRAY[]::UUID[]))
    AND EXISTS (
      SELECT 1
      FROM public.movements AS m
      WHERE m.registered_by = p.id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_movement_registrar_emails(UUID[])
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_movement_registrar_emails(UUID[])
  TO authenticated;

NOTIFY pgrst, 'reload schema';
