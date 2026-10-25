-- Ejecuta este script despues del esquema inicial para habilitar entregas atomicas FEFO.
CREATE OR REPLACE FUNCTION public.deliver_medication_fefo(
  p_medication_id UUID,
  p_quantity INTEGER,
  p_destination_or_beneficiary TEXT,
  p_motive_or_observation TEXT DEFAULT NULL
)
RETURNS TABLE (
  batch_id UUID,
  batch_number TEXT,
  quantity INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_remaining INTEGER := p_quantity;
  v_quantity INTEGER;
  v_batch RECORD;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad debe ser un entero mayor que cero.';
  END IF;

  IF NULLIF(BTRIM(p_destination_or_beneficiary), '') IS NULL THEN
    RAISE EXCEPTION 'El destino o beneficiario es obligatorio.';
  END IF;

  FOR v_batch IN
    SELECT
      b.id,
      b.batch_number,
      b.current_quantity AS available_quantity
    FROM public.batches AS b
    WHERE b.medication_id = p_medication_id
      AND b.current_quantity > 0
      AND b.expiration_date >= CURRENT_DATE
      AND b.status IN ('available', 'expiring_soon')
    ORDER BY b.expiration_date ASC, b.created_at ASC, b.id ASC
    FOR UPDATE
  LOOP
    v_quantity := LEAST(v_remaining, v_batch.available_quantity);

    UPDATE public.batches AS b
    SET
      current_quantity = b.current_quantity - v_quantity,
      status = CASE
        WHEN b.current_quantity - v_quantity = 0
          THEN 'out_of_stock'::public.batch_status_enum
        ELSE b.status
      END
    WHERE b.id = v_batch.id;

    INSERT INTO public.movements (
      batch_id,
      type,
      quantity,
      destination_or_beneficiary,
      registered_by,
      motive_or_observation
    )
    VALUES (
      v_batch.id,
      'donation_exit'::public.movement_type_enum,
      v_quantity,
      BTRIM(p_destination_or_beneficiary),
      auth.uid(),
      NULLIF(BTRIM(p_motive_or_observation), '')
    );

    batch_id := v_batch.id;
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

GRANT EXECUTE ON FUNCTION public.deliver_medication_fefo(UUID, INTEGER, TEXT, TEXT)
  TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
