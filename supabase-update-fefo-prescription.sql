CREATE OR REPLACE VIEW public.view_inventory_fefo AS
SELECT
  b.id AS batch_id,
  m.trade_name,
  m.active_ingredient,
  m.concentration,
  b.batch_number,
  b.expiration_date,
  (b.expiration_date - CURRENT_DATE) AS days_until_expiration,
  b.current_quantity,
  l.location_code,
  l.zone,
  m.requires_refrigeration,
  m.requires_prescription
FROM public.batches b
JOIN public.medications m ON b.medication_id = m.id
JOIN public.locations l ON b.location_id = l.id
WHERE b.current_quantity > 0
ORDER BY b.expiration_date ASC;
