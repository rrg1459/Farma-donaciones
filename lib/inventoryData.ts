import type {
  BatchItemFEFO,
  BatchStatus,
  Donor,
  Location,
  Medication,
  Movement,
  MovementType,
} from '../types/inventory';
import { getSupabaseClient } from './supabaseClient';

export interface DashboardData {
  fefoItems: BatchItemFEFO[];
  totalUnits: number;
  expiringUnits: number;
  expiredUnits: number;
  donatedUnits: number;
}

export interface InventoryRow extends BatchItemFEFO {
  id: string;
  status: BatchStatus | null;
}

export interface WarehouseBatch {
  id: string;
  batch_number: string;
  current_quantity: number;
  medication: Medication;
}

export interface WarehouseLocation extends Location {
  batches: WarehouseBatch[];
}

export interface MovementRow extends Movement {
  batch_number: string;
  medication: Medication;
  donor: Donor | null;
  registered_by_name: string | null;
}

export interface DeliveryMedicationOption {
  id: string;
  label: string;
  active_ingredient: string;
  requires_prescription: boolean;
  available_quantity: number;
  batch_count: number;
  batch_ids: string[];
}

export interface DonationFormOptions {
  donors: Donor[];
  medications: Medication[];
  locations: Location[];
}

export const INVENTORY_UPDATED_EVENT = 'inventory-updated';

function requireRows<T>(
  rows: T[] | null,
  error: { message: string } | null,
  source: string,
): T[] {
  if (error) {
    throw new Error(`No se pudieron leer ${source}: ${error.message}`);
  }

  if (!rows) {
    throw new Error(`Supabase no devolvió datos para ${source}.`);
  }

  return rows;
}

export async function loadDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseClient();
  const [fefoResponse, batchesResponse, movementsResponse] = await Promise.all([
    supabase
      .from('view_inventory_fefo')
      .select(
        'batch_id, trade_name, active_ingredient, concentration, batch_number, expiration_date, days_until_expiration, current_quantity, location_code, zone, requires_refrigeration, requires_prescription',
      )
      .order('expiration_date', { ascending: true }),
    supabase.from('batches').select('current_quantity, status'),
    supabase.from('movements').select('quantity, type'),
  ]);

  const fefoItems = requireRows(
    fefoResponse.data,
    fefoResponse.error,
    'la vista view_inventory_fefo',
  );
  const batches = requireRows(
    batchesResponse.data,
    batchesResponse.error,
    'la tabla batches',
  );
  const movements = requireRows(
    movementsResponse.data,
    movementsResponse.error,
    'la tabla movements',
  );

  return {
    fefoItems,
    totalUnits: batches.reduce((total, batch) => total + batch.current_quantity, 0),
    expiringUnits: fefoItems
      .filter(
        (item) =>
          item.days_until_expiration >= 0 && item.days_until_expiration <= 60,
      )
      .reduce((total, item) => total + item.current_quantity, 0),
    expiredUnits: batches
      .filter((batch) => batch.status === 'expired')
      .reduce((total, batch) => total + batch.current_quantity, 0),
    donatedUnits: movements
      .filter((movement) => movement.type === 'donation_exit')
      .reduce((total, movement) => total + movement.quantity, 0),
  };
}

export async function loadInventoryRows(): Promise<{
  rows: InventoryRow[];
  locations: Location[];
}> {
  const supabase = getSupabaseClient();
  const [batchesResponse, medicationsResponse, locationsResponse] =
    await Promise.all([
      supabase
        .from('batches')
        .select(
          'id, medication_id, location_id, batch_number, expiration_date, current_quantity, status',
        )
        .order('expiration_date', { ascending: true }),
      supabase.from('medications').select('*'),
      supabase.from('locations').select('*').order('location_code'),
    ]);

  const batches = requireRows(
    batchesResponse.data,
    batchesResponse.error,
    'la tabla batches',
  );
  const medications = requireRows(
    medicationsResponse.data,
    medicationsResponse.error,
    'la tabla medications',
  );
  const locations = requireRows(
    locationsResponse.data,
    locationsResponse.error,
    'la tabla locations',
  );
  const medicationById = new Map(
    medications.map((medication) => [medication.id, medication]),
  );
  const locationById = new Map(
    locations.map((location) => [location.id, location]),
  );

  const rows = batches.map((batch) => {
    const medication = medicationById.get(batch.medication_id);
    const location = locationById.get(batch.location_id);

    if (!medication || !location) {
      throw new Error(
        `El lote ${batch.batch_number} referencia un medicamento o una ubicación que no se pudo leer.`,
      );
    }

    return {
      id: batch.id,
      batch_id: batch.id,
      trade_name: medication.trade_name,
      active_ingredient: medication.active_ingredient,
      concentration: medication.concentration,
      batch_number: batch.batch_number,
      expiration_date: batch.expiration_date,
      days_until_expiration: Math.floor(
        (new Date(`${batch.expiration_date}T00:00:00Z`).getTime() -
          new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`).getTime()) /
          86_400_000,
      ),
      current_quantity: batch.current_quantity,
      location_code: location.location_code,
      zone: location.zone,
      requires_refrigeration: medication.requires_refrigeration,
      requires_prescription: medication.requires_prescription,
      status: batch.status,
    };
  });

  return { rows, locations };
}

export async function loadWarehouseLocations(): Promise<WarehouseLocation[]> {
  const supabase = getSupabaseClient();
  const [locationsResponse, batchesResponse, medicationsResponse] =
    await Promise.all([
      supabase.from('locations').select('*').order('zone').order('location_code'),
      supabase
        .from('batches')
        .select('id, batch_number, current_quantity, medication_id, location_id')
        .gt('current_quantity', 0),
      supabase.from('medications').select('*'),
    ]);

  const locations = requireRows(
    locationsResponse.data,
    locationsResponse.error,
    'la tabla locations',
  );
  const batches = requireRows(
    batchesResponse.data,
    batchesResponse.error,
    'la tabla batches',
  );
  const medications = requireRows(
    medicationsResponse.data,
    medicationsResponse.error,
    'la tabla medications',
  );
  const medicationById = new Map(
    medications.map((medication) => [medication.id, medication]),
  );

  return locations.map((location) => ({
    ...location,
    batches: batches
      .filter((batch) => batch.location_id === location.id)
      .map((batch) => {
        const medication = medicationById.get(batch.medication_id);
        if (!medication) {
          throw new Error(
            `El lote ${batch.batch_number} referencia un medicamento que no se pudo leer.`,
          );
        }

        return {
          id: batch.id,
          batch_number: batch.batch_number,
          current_quantity: batch.current_quantity,
          medication,
        };
      }),
  }));
}

export async function loadMovementRows(): Promise<MovementRow[]> {
  const supabase = getSupabaseClient();
  const [movementsResponse, batchesResponse, medicationsResponse, donorsResponse] =
    await Promise.all([
      supabase
        .from('movements')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('batches')
        .select('id, batch_number, medication_id, donor_id'),
      supabase.from('medications').select('*'),
      supabase.from('donors').select('*'),
    ]);

  const movements = requireRows(
    movementsResponse.data,
    movementsResponse.error,
    'la tabla movements',
  );
  const batches = requireRows(
    batchesResponse.data,
    batchesResponse.error,
    'la tabla batches',
  );
  const medications = requireRows(
    medicationsResponse.data,
    medicationsResponse.error,
    'la tabla medications',
  );
  const donors = requireRows(
    donorsResponse.data,
    donorsResponse.error,
    'la tabla donors',
  );
  const registrarIds = [
    ...new Set(
      movements
        .map((movement) => movement.registered_by)
        .filter((userId): userId is string => userId !== null),
    ),
  ];
  const registrarNamesResponse = await supabase.rpc(
    'get_movement_registrar_emails',
    { p_user_ids: registrarIds },
  );
  const registrarNames = requireRows(
    registrarNamesResponse.data,
    registrarNamesResponse.error,
    'los nombres de los responsables de movimientos',
  );
  const batchById = new Map(batches.map((batch) => [batch.id, batch]));
  const medicationById = new Map(
    medications.map((medication) => [medication.id, medication]),
  );
  const donorById = new Map(donors.map((donor) => [donor.id, donor]));
  const registrarNameById = new Map(
    registrarNames.map(({ user_id, full_name }) => [user_id, full_name]),
  );

  return movements.map((movement) => {
    const batch = batchById.get(movement.batch_id);
    const medication = batch
      ? medicationById.get(batch.medication_id)
      : undefined;

    if (!batch || !medication) {
      throw new Error(
        `El movimiento ${movement.id} referencia un lote o medicamento que no se pudo leer.`,
      );
    }

    return {
      ...movement,
      batch_number: batch.batch_number,
      medication,
      donor: batch.donor_id ? donorById.get(batch.donor_id) ?? null : null,
      registered_by_name: movement.registered_by
        ? registrarNameById.get(movement.registered_by) ?? null
        : null,
    };
  });
}

export async function loadDeliveryMedicationOptions(): Promise<
  DeliveryMedicationOption[]
> {
  const supabase = getSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);
  const [batchesResponse, medicationsResponse] = await Promise.all([
    supabase
      .from('batches')
      .select('id, medication_id, current_quantity')
      .gt('current_quantity', 0)
      .gte('expiration_date', today)
      .in('status', ['available', 'expiring_soon']),
    supabase
      .from('medications')
      .select('id, trade_name, active_ingredient, concentration, requires_prescription')
      .order('trade_name'),
  ]);

  const batches = requireRows(
    batchesResponse.data,
    batchesResponse.error,
    'los lotes disponibles para entrega',
  );
  const medications = requireRows(
    medicationsResponse.data,
    medicationsResponse.error,
    'la tabla medications',
  );
  const availableByMedication = new Map<
    string,
    { quantity: number; batches: number; ids: string[] }
  >();

  batches.forEach((batch) => {
    const current = availableByMedication.get(batch.medication_id) ?? {
      quantity: 0,
      batches: 0,
      ids: [],
    };
    current.quantity += batch.current_quantity;
    current.batches += 1;
    current.ids.push(batch.id);
    availableByMedication.set(batch.medication_id, current);
  });

  return medications.flatMap((medication) => {
    const available = availableByMedication.get(medication.id);
    if (!available) {
      return [];
    }

    return [{
      id: medication.id,
      label: `${medication.trade_name} ${medication.concentration}`,
      active_ingredient: medication.active_ingredient,
      requires_prescription: medication.requires_prescription,
      available_quantity: available.quantity,
      batch_count: available.batches,
      batch_ids: available.ids,
    }];
  });
}

export async function loadDonationFormOptions(): Promise<DonationFormOptions> {
  const supabase = getSupabaseClient();
  const [donorsResponse, medicationsResponse, locationsResponse] =
    await Promise.all([
      supabase.from('donors').select('*').order('name_or_company'),
      supabase.from('medications').select('*').order('trade_name'),
      supabase.from('locations').select('*').order('zone').order('location_code'),
    ]);

  return {
    donors: requireRows(
      donorsResponse.data,
      donorsResponse.error,
      'la tabla donors',
    ),
    medications: requireRows(
      medicationsResponse.data,
      medicationsResponse.error,
      'la tabla medications',
    ),
    locations: requireRows(
      locationsResponse.data,
      locationsResponse.error,
      'la tabla locations',
    ),
  };
}

export const movementTypeLabels: Record<MovementType, string> = {
  donation_entry: 'Entrada por donación',
  donation_exit: 'Salida por donación',
  inventory_adjustment: 'Ajuste de inventario',
  expired_discard: 'Descarte por caducidad',
};
