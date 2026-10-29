-- Ejecuta este script despues del esquema inicial para habilitar recepciones atomicas.
CREATE OR REPLACE FUNCTION public.register_donation(
  p_donor_id UUID,
  p_donor_name TEXT,
  p_donor_phone TEXT,
  p_donor_email TEXT,
  p_donor_type TEXT,
  p_medication_id UUID,
  p_trade_name TEXT,
  p_active_ingredient TEXT,
  p_concentration TEXT,
  p_pharmaceutical_form public.pharmaceutical_form_enum,
  p_requires_refrigeration BOOLEAN,
  p_requires_prescription BOOLEAN,
  p_location_id UUID,
  p_location_zone TEXT,
  p_location_shelf_unit TEXT,
  p_location_tier_bin TEXT,
  p_location_code TEXT,
  p_location_description TEXT,
  p_batch_number TEXT,
  p_expiration_date DATE,
  p_quantity INTEGER,
  p_observations TEXT DEFAULT NULL
)
RETURNS TABLE (
  batch_id UUID,
  batch_number TEXT,
  quantity INTEGER,
  status public.batch_status_enum
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_registered_by UUID := auth.uid();
  v_donor_id UUID;
  v_medication_id UUID;
  v_location_id UUID;
  v_batch_id UUID;
  v_status public.batch_status_enum;
BEGIN
  IF v_registered_by IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión para registrar una donación.'
      USING ERRCODE = '28000';
  END IF;

  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad recibida debe ser un entero mayor que cero.';
  END IF;

  IF NULLIF(BTRIM(p_batch_number), '') IS NULL THEN
    RAISE EXCEPTION 'El numero de lote es obligatorio.';
  END IF;

  IF p_expiration_date IS NULL OR p_expiration_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'No se pueden registrar medicamentos caducados como una donacion disponible.';
  END IF;

  IF p_location_id IS NULL THEN
    IF NULLIF(BTRIM(p_location_zone), '') IS NULL
      OR NULLIF(BTRIM(p_location_shelf_unit), '') IS NULL
      OR NULLIF(BTRIM(p_location_tier_bin), '') IS NULL
      OR NULLIF(BTRIM(p_location_code), '') IS NULL THEN
      RAISE EXCEPTION 'La zona, estante, nivel y codigo son obligatorios para una nueva ubicacion.';
    END IF;

    INSERT INTO public.locations (
      zone,
      shelf_unit,
      tier_bin,
      location_code,
      description
    )
    VALUES (
      BTRIM(p_location_zone),
      BTRIM(p_location_shelf_unit),
      BTRIM(p_location_tier_bin),
      BTRIM(p_location_code),
      NULLIF(BTRIM(p_location_description), '')
    )
    RETURNING id INTO v_location_id;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public.locations WHERE id = p_location_id) THEN
      RAISE EXCEPTION 'La ubicacion seleccionada no existe.';
    END IF;
    v_location_id := p_location_id;
  END IF;

  IF p_donor_id IS NULL THEN
    IF NULLIF(BTRIM(p_donor_name), '') IS NULL THEN
      RAISE EXCEPTION 'El nombre del donante es obligatorio.';
    END IF;

    INSERT INTO public.donors (
      name_or_company,
      contact_phone,
      contact_email,
      donor_type
    )
    VALUES (
      BTRIM(p_donor_name),
      NULLIF(BTRIM(p_donor_phone), ''),
      NULLIF(BTRIM(p_donor_email), ''),
      COALESCE(NULLIF(BTRIM(p_donor_type), ''), 'individual')
    )
    RETURNING id INTO v_donor_id;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public.donors WHERE id = p_donor_id) THEN
      RAISE EXCEPTION 'El donante seleccionado ya no existe.';
    END IF;
    v_donor_id := p_donor_id;
  END IF;

  IF p_medication_id IS NULL THEN
    IF NULLIF(BTRIM(p_trade_name), '') IS NULL
      OR NULLIF(BTRIM(p_active_ingredient), '') IS NULL
      OR NULLIF(BTRIM(p_concentration), '') IS NULL THEN
      RAISE EXCEPTION 'El nombre, principio activo y concentracion son obligatorios.';
    END IF;

    INSERT INTO public.medications (
      trade_name,
      active_ingredient,
      concentration,
      pharmaceutical_form,
      requires_refrigeration,
      requires_prescription
    )
    VALUES (
      BTRIM(p_trade_name),
      BTRIM(p_active_ingredient),
      BTRIM(p_concentration),
      p_pharmaceutical_form,
      COALESCE(p_requires_refrigeration, FALSE),
      COALESCE(p_requires_prescription, FALSE)
    )
    RETURNING id INTO v_medication_id;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public.medications WHERE id = p_medication_id) THEN
      RAISE EXCEPTION 'El medicamento seleccionado ya no existe.';
    END IF;
    v_medication_id := p_medication_id;
  END IF;

  v_status := CASE
    WHEN p_expiration_date <= CURRENT_DATE + 60
      THEN 'expiring_soon'::public.batch_status_enum
    ELSE 'available'::public.batch_status_enum
  END;

  INSERT INTO public.batches (
    medication_id,
    donor_id,
    location_id,
    batch_number,
    expiration_date,
    initial_quantity,
    current_quantity,
    status,
    observations
  )
  VALUES (
    v_medication_id,
    v_donor_id,
    v_location_id,
    BTRIM(p_batch_number),
    p_expiration_date,
    p_quantity,
    p_quantity,
    v_status,
    NULLIF(BTRIM(p_observations), '')
  )
  RETURNING id INTO v_batch_id;

  INSERT INTO public.movements (
    batch_id,
    type,
    quantity,
    destination_or_beneficiary,
    registered_by,
    motive_or_observation
  )
  VALUES (
    v_batch_id,
    'donation_entry'::public.movement_type_enum,
    p_quantity,
    NULL,
    v_registered_by,
    NULLIF(BTRIM(p_observations), '')
  );

  RETURN QUERY
  SELECT v_batch_id, BTRIM(p_batch_number), p_quantity, v_status;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_donation(
  UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT,
  public.pharmaceutical_form_enum, BOOLEAN, BOOLEAN, UUID, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, DATE, INTEGER, TEXT
) TO authenticated;

REVOKE ALL ON FUNCTION public.register_donation(
  UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT,
  public.pharmaceutical_form_enum, BOOLEAN, BOOLEAN, UUID, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, DATE, INTEGER, TEXT
) FROM PUBLIC, anon;

NOTIFY pgrst, 'reload schema';
