-- Ejecutar despues del esquema inicial y de las funciones de donacion/entrega.
-- Agrega inventario de insumos y equipos sin cambiar el flujo FEFO de medicamentos.
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (BTRIM(name) <> ''),
  item_type TEXT NOT NULL CHECK (item_type IN ('supply', 'equipment')),
  unit TEXT NOT NULL DEFAULT 'unidad' CHECK (BTRIM(unit) <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.inventory_item_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  batch_number TEXT,
  expiration_date DATE,
  initial_quantity INTEGER NOT NULL CHECK (initial_quantity > 0),
  current_quantity INTEGER NOT NULL CHECK (current_quantity >= 0),
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'expired', 'out_of_stock', 'quarantine')),
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (expiration_date IS NULL OR batch_number IS NOT NULL)
);

ALTER TABLE public.movements
  ALTER COLUMN batch_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS item_batch_id UUID
    REFERENCES public.inventory_item_batches(id) ON DELETE RESTRICT;

ALTER TABLE public.movements
  DROP CONSTRAINT IF EXISTS movements_inventory_reference_check;

ALTER TABLE public.movements
  ADD CONSTRAINT movements_inventory_reference_check
  CHECK (num_nonnulls(batch_id, item_batch_id) = 1);

CREATE INDEX inventory_item_batches_item_stock_idx
  ON public.inventory_item_batches (item_id, expiration_date, created_at)
  WHERE current_quantity > 0;
CREATE INDEX movements_item_batch_idx
  ON public.movements (item_batch_id)
  WHERE item_batch_id IS NOT NULL;

GRANT SELECT ON public.inventory_items, public.inventory_item_batches TO authenticated;

CREATE OR REPLACE FUNCTION public.register_inventory_item_donation(
  p_donor_id UUID,
  p_donor_name TEXT,
  p_donor_phone TEXT,
  p_donor_email TEXT,
  p_donor_type TEXT,
  p_item_id UUID,
  p_item_name TEXT,
  p_item_type TEXT,
  p_unit TEXT,
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
RETURNS TABLE (item_batch_id UUID, item_name TEXT, quantity INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_registered_by UUID := auth.uid();
  v_donor_id UUID;
  v_item_id UUID;
  v_location_id UUID;
  v_item_batch_id UUID;
  v_item_name TEXT;
BEGIN
  IF v_registered_by IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión para registrar una donación.'
      USING ERRCODE = '28000';
  END IF;
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad recibida debe ser un entero mayor que cero.';
  END IF;
  IF p_item_type IS NULL OR p_item_type NOT IN ('supply', 'equipment') THEN
    RAISE EXCEPTION 'El tipo debe ser insumo o equipo médico.';
  END IF;
  IF p_expiration_date IS NOT NULL
    AND (p_expiration_date < CURRENT_DATE + 7
      OR NULLIF(BTRIM(p_batch_number), '') IS NULL) THEN
    RAISE EXCEPTION 'Los artículos con caducidad requieren lote y al menos 7 días de vigencia.';
  END IF;

  IF p_location_id IS NULL THEN
    IF NULLIF(BTRIM(p_location_zone), '') IS NULL
      OR NULLIF(BTRIM(p_location_shelf_unit), '') IS NULL
      OR NULLIF(BTRIM(p_location_tier_bin), '') IS NULL
      OR NULLIF(BTRIM(p_location_code), '') IS NULL THEN
      RAISE EXCEPTION 'La zona, estante, nivel y codigo son obligatorios para una nueva ubicacion.';
    END IF;
    INSERT INTO public.locations (
      zone, shelf_unit, tier_bin, location_code, description
    ) VALUES (
      BTRIM(p_location_zone), BTRIM(p_location_shelf_unit),
      BTRIM(p_location_tier_bin), BTRIM(p_location_code),
      NULLIF(BTRIM(p_location_description), '')
    ) RETURNING id INTO v_location_id;
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
      name_or_company, contact_phone, contact_email, donor_type
    ) VALUES (
      BTRIM(p_donor_name), NULLIF(BTRIM(p_donor_phone), ''),
      NULLIF(BTRIM(p_donor_email), ''),
      COALESCE(NULLIF(BTRIM(p_donor_type), ''), 'individual')
    ) RETURNING id INTO v_donor_id;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public.donors WHERE id = p_donor_id) THEN
      RAISE EXCEPTION 'El donante seleccionado ya no existe.';
    END IF;
    v_donor_id := p_donor_id;
  END IF;

  IF p_item_id IS NULL THEN
    IF NULLIF(BTRIM(p_item_name), '') IS NULL
      OR NULLIF(BTRIM(p_unit), '') IS NULL THEN
      RAISE EXCEPTION 'El nombre del articulo y la unidad son obligatorios.';
    END IF;
    INSERT INTO public.inventory_items (name, item_type, unit)
    VALUES (BTRIM(p_item_name), p_item_type, BTRIM(p_unit))
    RETURNING id, name INTO v_item_id, v_item_name;
  ELSE
    SELECT id, name INTO v_item_id, v_item_name
    FROM public.inventory_items
    WHERE id = p_item_id AND item_type = p_item_type;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'El articulo seleccionado ya no existe o no coincide con el tipo.';
    END IF;
  END IF;

  INSERT INTO public.inventory_item_batches (
    item_id, donor_id, location_id, batch_number, expiration_date,
    initial_quantity, current_quantity, observations
  ) VALUES (
    v_item_id, v_donor_id, v_location_id,
    NULLIF(BTRIM(p_batch_number), ''), p_expiration_date,
    p_quantity, p_quantity, NULLIF(BTRIM(p_observations), '')
  ) RETURNING id INTO v_item_batch_id;

  INSERT INTO public.movements (
    item_batch_id, type, quantity, registered_by, motive_or_observation
  ) VALUES (
    v_item_batch_id, 'donation_entry'::public.movement_type_enum,
    p_quantity, v_registered_by, NULLIF(BTRIM(p_observations), '')
  );

  RETURN QUERY SELECT v_item_batch_id, v_item_name, p_quantity;
END;
$$;

CREATE OR REPLACE FUNCTION public.deliver_inventory_item(
  p_item_id UUID,
  p_quantity INTEGER,
  p_destination_or_beneficiary TEXT,
  p_motive_or_observation TEXT DEFAULT NULL
)
RETURNS TABLE (item_batch_id UUID, batch_number TEXT, quantity INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_registered_by UUID := auth.uid();
  v_remaining INTEGER := p_quantity;
  v_quantity INTEGER;
  v_batch RECORD;
BEGIN
  IF v_registered_by IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión para registrar una entrega.'
      USING ERRCODE = '28000';
  END IF;
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad debe ser un entero mayor que cero.';
  END IF;
  IF NULLIF(BTRIM(p_destination_or_beneficiary), '') IS NULL THEN
    RAISE EXCEPTION 'El destino o beneficiario es obligatorio.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE id = p_item_id) THEN
    RAISE EXCEPTION 'El articulo seleccionado no existe.';
  END IF;

  FOR v_batch IN
    SELECT b.id, b.batch_number, b.current_quantity
    FROM public.inventory_item_batches AS b
    WHERE b.item_id = p_item_id
      AND b.current_quantity > 0
      AND (b.expiration_date IS NULL OR b.expiration_date >= CURRENT_DATE)
      AND b.status = 'available'
    ORDER BY b.expiration_date ASC NULLS LAST, b.created_at ASC, b.id ASC
    FOR UPDATE
  LOOP
    v_quantity := LEAST(v_remaining, v_batch.current_quantity);

    UPDATE public.inventory_item_batches AS b
    SET current_quantity = b.current_quantity - v_quantity,
        status = CASE WHEN b.current_quantity - v_quantity = 0
          THEN 'out_of_stock' ELSE b.status END
    WHERE b.id = v_batch.id;

    INSERT INTO public.movements (
      item_batch_id, type, quantity, destination_or_beneficiary,
      registered_by, motive_or_observation
    ) VALUES (
      v_batch.id, 'donation_exit'::public.movement_type_enum, v_quantity,
      BTRIM(p_destination_or_beneficiary), v_registered_by,
      NULLIF(BTRIM(p_motive_or_observation), '')
    );

    item_batch_id := v_batch.id;
    batch_number := v_batch.batch_number;
    quantity := v_quantity;
    RETURN NEXT;

    v_remaining := v_remaining - v_quantity;
    EXIT WHEN v_remaining = 0;
  END LOOP;

  IF v_remaining > 0 THEN
    RAISE EXCEPTION 'Stock insuficiente: faltan % unidades para completar la entrega.', v_remaining;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.register_inventory_item_donation(
  UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, UUID, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, DATE, INTEGER, TEXT
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_inventory_item_donation(
  UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, UUID, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, DATE, INTEGER, TEXT
) TO authenticated;

REVOKE ALL ON FUNCTION public.deliver_inventory_item(UUID, INTEGER, TEXT, TEXT)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.deliver_inventory_item(UUID, INTEGER, TEXT, TEXT)
  TO authenticated;

NOTIFY pgrst, 'reload schema';
