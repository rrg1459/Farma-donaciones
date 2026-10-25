-- ATENCION: este seed elimina todos los datos existentes de estas cinco tablas.
-- Ejecutar solo en desarrollo o despues de respaldar los datos que quieras conservar.
BEGIN;

-- Limpiar primero las tablas dependientes para respetar las claves foraneas.
DELETE FROM public.movements;
DELETE FROM public.batches;
DELETE FROM public.donors;
DELETE FROM public.medications;
DELETE FROM public.locations;

INSERT INTO public.locations (
  id, zone, shelf_unit, tier_bin, location_code, description, created_at
) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Pasillo A', 'Estante 2', 'Nivel 1', 'PAS-A-SH2-T1', 'Antibióticos', '2026-01-10T09:00:00Z'),
  ('10000000-0000-4000-8000-000000000002', 'Refrigeración', 'Nevera 1', 'Nivel 2', 'REF-1-T2', 'Cadena de frío entre 2 °C y 8 °C', '2026-01-10T09:05:00Z'),
  ('10000000-0000-4000-8000-000000000003', 'Pasillo B', 'Estante 1', 'Nivel 3', 'PAS-B-SH1-T3', 'Analgésicos', '2026-01-10T09:10:00Z'),
  ('10000000-0000-4000-8000-000000000004', 'Pasillo A', 'Estante 1', 'Nivel 2', 'PAS-A-SH1-T2', 'Antihipertensivos', '2026-01-10T09:15:00Z'),
  ('10000000-0000-4000-8000-000000000005', 'Pasillo C', 'Estante 4', 'Nivel 1', 'PAS-C-SH4-T1', 'Inhaladores', '2026-01-10T09:20:00Z'),
  ('10000000-0000-4000-8000-000000000006', 'Pasillo B', 'Estante 2', 'Nivel 1', 'PAS-B-SH2-T1', 'Antiinflamatorios', '2026-01-10T09:25:00Z'),
  ('10000000-0000-4000-8000-000000000007', 'Refrigeración', 'Nevera 2', 'Nivel 1', 'REF-2-T1', 'Vacunas', '2026-01-10T09:30:00Z'),
  ('10000000-0000-4000-8000-000000000008', 'Cuarentena', 'Estante Z-0', 'Caja A', 'ZON-CUA-SH0-T1', 'Medicamentos caducados o pendientes de revisión', '2026-01-10T09:35:00Z');

INSERT INTO public.medications (
  id, trade_name, active_ingredient, concentration, pharmaceutical_form,
  requires_refrigeration, requires_prescription, created_at
) VALUES
  ('20000000-0000-4000-8000-000000000001', 'Amoxicilina', 'Amoxicilina', '500 mg', 'capsule', FALSE, TRUE, '2026-01-12T10:00:00Z'),
  ('20000000-0000-4000-8000-000000000002', 'Insulina NPH', 'Insulina Humana', '100 UI/ml', 'injectable_ampoule', TRUE, TRUE, '2026-01-12T10:05:00Z'),
  ('20000000-0000-4000-8000-000000000003', 'Paracetamol', 'Acetaminofén', '500 mg', 'tablet_pill', FALSE, FALSE, '2026-01-12T10:10:00Z'),
  ('20000000-0000-4000-8000-000000000004', 'Losartán Potásico', 'Losartán', '50 mg', 'tablet_pill', FALSE, TRUE, '2026-01-12T10:15:00Z'),
  ('20000000-0000-4000-8000-000000000005', 'Salbutamol', 'Salbutamol', '100 mcg/dosis', 'inhaler', FALSE, TRUE, '2026-01-12T10:20:00Z'),
  ('20000000-0000-4000-8000-000000000006', 'Ibuprofeno', 'Ibuprofeno', '400 mg', 'tablet_pill', FALSE, FALSE, '2026-01-12T10:25:00Z'),
  ('20000000-0000-4000-8000-000000000007', 'Vacuna Hepatitis B', 'Antígeno de superficie de hepatitis B', '20 mcg/ml', 'injectable_ampoule', TRUE, TRUE, '2026-01-12T10:30:00Z'),
  ('20000000-0000-4000-8000-000000000008', 'Aspirina', 'Ácido acetilsalicílico', '100 mg', 'tablet_pill', FALSE, FALSE, '2026-01-12T10:35:00Z');

INSERT INTO public.donors (
  id, name_or_company, contact_phone, contact_email, donor_type, created_at
) VALUES
  ('30000000-0000-4000-8000-000000000001', 'Fundación Salud para Todos', '+52 555 010 1001', 'donaciones@saludparatodos.example', 'ngo', '2026-01-15T11:00:00Z'),
  ('30000000-0000-4000-8000-000000000002', 'Farmacia San Miguel', '+52 555 010 1002', 'contacto@farmaciasanmiguel.example', 'pharmacy', '2026-01-15T11:05:00Z'),
  ('30000000-0000-4000-8000-000000000003', 'Red Médica Solidaria', '+52 555 010 1003', 'donaciones@redmedica.example', 'ngo', '2026-01-15T11:10:00Z');

INSERT INTO public.batches (
  id, medication_id, donor_id, location_id, batch_number, expiration_date,
  initial_quantity, current_quantity, status, observations, created_at
) VALUES
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'AMX-2608-A', '2026-11-10', 120, 45, 'expiring_soon', NULL, '2026-08-24T10:42:00Z'),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'INS-7741-X', '2026-11-24', 16, 12, 'expiring_soon', 'Mantener cadena de frío entre 2 °C y 8 °C.', '2026-08-24T09:18:00Z'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', 'PAR-9902-A', '2027-01-16', 360, 300, 'available', NULL, '2026-07-23T15:36:00Z'),
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000004', 'LOS-3312-C', '2027-03-15', 200, 150, 'available', NULL, '2026-07-23T11:05:00Z'),
  ('40000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000005', 'SAL-8810-D', '2027-08-20', 30, 28, 'available', NULL, '2026-07-22T14:27:00Z'),
  ('40000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000006', 'IBU-1140-B', '2027-02-18', 100, 80, 'available', NULL, '2026-07-22T14:00:00Z'),
  ('40000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000007', 'VHB-6208-R', '2027-05-20', 60, 50, 'available', 'Mantener refrigerada.', '2026-07-21T09:52:00Z'),
  ('40000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000008', 'ASP-2201-Q', '2026-10-01', 15, 15, 'expired', 'Retirar del inventario disponible.', '2026-01-20T09:00:00Z');

-- registered_by queda NULL para no inventar UUIDs que no existan en auth.users.
INSERT INTO public.movements (
  id, batch_id, type, quantity, destination_or_beneficiary,
  registered_by, motive_or_observation, created_at
) VALUES
  ('60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'donation_entry', 120, NULL, NULL, 'Recepción de donación.', '2026-08-24T10:42:00Z'),
  ('60000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'donation_exit', 4, 'Centro Comunitario San José', NULL, NULL, '2026-10-24T09:18:00Z'),
  ('60000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003', 'donation_exit', 60, 'Comedor Santa María', NULL, NULL, '2026-10-23T15:36:00Z'),
  ('60000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000004', 'donation_entry', 200, NULL, NULL, 'Recepción de donación.', '2026-07-22T11:05:00Z'),
  ('60000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000006', 'donation_exit', 20, 'Clínica Comunitaria Norte', NULL, NULL, '2026-10-22T14:27:00Z'),
  ('60000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-000000000007', 'donation_entry', 60, NULL, NULL, 'Recepción de donación.', '2026-07-21T09:00:00Z'),
  ('60000000-0000-4000-8000-000000000007', '40000000-0000-4000-8000-000000000001', 'donation_exit', 75, 'Jornada Médica Central', NULL, 'Entrega prioritaria FEFO.', '2026-10-20T13:30:00Z'),
  ('60000000-0000-4000-8000-000000000008', '40000000-0000-4000-8000-000000000002', 'donation_entry', 16, NULL, NULL, 'Recepción de donación.', '2026-08-24T09:00:00Z'),
  ('60000000-0000-4000-8000-000000000009', '40000000-0000-4000-8000-000000000003', 'donation_entry', 360, NULL, NULL, 'Recepción de donación.', '2026-07-23T14:00:00Z'),
  ('60000000-0000-4000-8000-000000000010', '40000000-0000-4000-8000-000000000004', 'donation_exit', 50, 'Centro de Salud Norte', NULL, NULL, '2026-10-17T12:15:00Z'),
  ('60000000-0000-4000-8000-000000000011', '40000000-0000-4000-8000-000000000005', 'donation_entry', 30, NULL, NULL, 'Recepción de donación.', '2026-07-22T13:20:00Z'),
  ('60000000-0000-4000-8000-000000000012', '40000000-0000-4000-8000-000000000005', 'donation_exit', 2, 'Jornada Médica Central', NULL, NULL, '2026-10-15T14:00:00Z'),
  ('60000000-0000-4000-8000-000000000013', '40000000-0000-4000-8000-000000000006', 'donation_entry', 100, NULL, NULL, 'Recepción de donación.', '2026-07-20T10:00:00Z'),
  ('60000000-0000-4000-8000-000000000014', '40000000-0000-4000-8000-000000000007', 'donation_exit', 10, 'Clínica Comunitaria Norte', NULL, NULL, '2026-10-13T09:30:00Z'),
  ('60000000-0000-4000-8000-000000000015', '40000000-0000-4000-8000-000000000008', 'donation_entry', 15, NULL, NULL, 'Recepción de donación.', '2026-01-20T09:00:00Z');

COMMIT;
