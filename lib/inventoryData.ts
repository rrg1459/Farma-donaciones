import type {
  BatchItemFEFO,
  BatchStatus,
  Donor,
  InventoryItem,
  InventoryItemType,
  Location,
  Medication,
  Movement,
  MovementType,
  PackagingUnit,
} from '../types/inventory';
import { getSupabaseClient } from './supabaseClient';

export interface DashboardData {
  fefoItems: BatchItemFEFO[];
  totalUnits: number;
  expiringUnits: number;
  expiredUnits: number;
  donatedUnits: number;
}

export interface InventoryRow {
  id: string;
  batch_id: string;
  location_id: string;
  item_type: 'medication' | InventoryItemType;
  trade_name: string;
  active_ingredient: string;
  concentration: string;
  batch_number: string | null;
  expiration_date: string | null;
  packaging_unit: PackagingUnit | null;
  days_until_expiration: number | null;
  current_quantity: number;
  location_code: string;
  zone: string;
  requires_refrigeration: boolean;
  requires_prescription: boolean;
  initial_quantity: number;
  status: BatchStatus | null;
  unit?: string;
}

export interface WarehouseBatch {
  id: string;
  location_id: string;
  batch_number: string | null;
  current_quantity: number;
  medication: Medication | null;
  item_name: string | null;
  item_unit: string | null;
}

export interface WarehouseLocation extends Location {
  batches: WarehouseBatch[];
}

export interface MovementRow extends Movement {
  batch_number: string | null;
  medication: Medication | null;
  item: InventoryItem | null;
  donor: Donor | null;
  registered_by_name: string | null;
}

export interface DeliveryItemOption {
  id: string;
  label: string;
  item_type: 'medication' | InventoryItemType;
  active_ingredient: string | null;
  requires_prescription: boolean;
  available_quantity: number;
  batch_count: number;
  batch_ids: string[];
}

export interface DonationFormOptions {
  donors: Donor[];
  medications: Medication[];
  inventoryItems: InventoryItem[];
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
  const [
    fefoResponse,
    batchesResponse,
    itemBatchesResponse,
    itemCatalogResponse,
    locationsResponse,
    movementsResponse,
  ] = await Promise.all([
    supabase
      .from('view_inventory_fefo')
      .select(
        'batch_id, trade_name, active_ingredient, concentration, batch_number, expiration_date, days_until_expiration, current_quantity, location_code, zone, requires_refrigeration, requires_prescription',
      )
      .order('expiration_date', { ascending: true }),
    supabase.from('batches').select('current_quantity, status'),
    supabase.from('inventory_item_batches').select(
      'id, item_id, location_id, batch_number, expiration_date, current_quantity, status',
    ),
    supabase.from('inventory_items').select('id, name, item_type, unit'),
    supabase.from('locations').select('id, location_code, zone'),
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
  const itemBatches = requireRows(
    itemBatchesResponse.data,
    itemBatchesResponse.error,
    'la tabla inventory_item_batches',
  );
  const itemCatalog = requireRows(
    itemCatalogResponse.data,
    itemCatalogResponse.error,
    'la tabla inventory_items',
  );
  const locations = requireRows(
    locationsResponse.data,
    locationsResponse.error,
    'la tabla locations',
  );

  const itemById = new Map(itemCatalog.map((item) => [item.id, item]));
  const locationById = new Map(locations.map((location) => [location.id, location]));
  const today = new Date().toISOString().slice(0, 10);
  const itemFefoRows = itemBatches.flatMap((batch) => {
    if (!batch.expiration_date || batch.current_quantity <= 0) return [];
    const item = itemById.get(batch.item_id);
    const location = locationById.get(batch.location_id);
    if (!item || !location) {
      throw new Error(
        `El registro de inventario ${batch.id} referencia un articulo o una ubicacion que no se pudo leer.`,
      );
    }
    return [{
      batch_id: batch.id,
      trade_name: item.name,
      active_ingredient: item.item_type === 'supply' ? 'Insumo médico' : 'Equipo médico',
      concentration: item.unit,
      batch_number: batch.batch_number ?? '',
      expiration_date: batch.expiration_date,
      days_until_expiration: Math.floor(
        (new Date(`${batch.expiration_date}T00:00:00Z`).getTime() -
          new Date(`${today}T00:00:00Z`).getTime()) / 86_400_000,
      ),
      current_quantity: batch.current_quantity,
      location_code: location.location_code,
      zone: location.zone,
      requires_refrigeration: false,
      requires_prescription: false,
    }];
  });
  const allFefoItems = [...fefoItems, ...itemFefoRows].sort((a, b) =>
    a.expiration_date.localeCompare(b.expiration_date),
  );

  return {
    fefoItems: allFefoItems,
    totalUnits:
      batches.reduce((total, batch) => total + batch.current_quantity, 0) +
      itemBatches.reduce((total, batch) => total + batch.current_quantity, 0),
    expiringUnits: allFefoItems
      .filter(
        (item) =>
          item.days_until_expiration >= 0 && item.days_until_expiration <= 60,
      )
      .reduce((total, item) => total + item.current_quantity, 0),
    expiredUnits: batches
      .filter((batch) => batch.status === 'expired')
      .reduce((total, batch) => total + batch.current_quantity, 0) +
      itemBatches
        .filter((batch) =>
          batch.current_quantity > 0 &&
          (batch.status === 'expired' ||
            (batch.expiration_date !== null && batch.expiration_date < today)),
        )
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
  const [batchesResponse, medicationsResponse, locationsResponse, itemBatchesResponse, itemsResponse] =
    await Promise.all([
      supabase
        .from('batches')
        .select(
          'id, medication_id, location_id, batch_number, expiration_date, packaging_unit, initial_quantity, current_quantity, status',
        )
        .order('expiration_date', { ascending: true }),
      supabase.from('medications').select('*'),
      supabase.from('locations').select('*').order('location_code'),
      supabase.from('inventory_item_batches').select(
        'id, item_id, location_id, batch_number, expiration_date, initial_quantity, current_quantity, status',
      ).order('expiration_date', { ascending: true, nullsFirst: false }),
      supabase.from('inventory_items').select('*'),
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
  const itemBatches = requireRows(
    itemBatchesResponse.data,
    itemBatchesResponse.error,
    'la tabla inventory_item_batches',
  );
  const items = requireRows(
    itemsResponse.data,
    itemsResponse.error,
    'la tabla inventory_items',
  );
  const medicationById = new Map(
    medications.map((medication) => [medication.id, medication]),
  );
  const locationById = new Map(
    locations.map((location) => [location.id, location]),
  );

  const medicationRows = batches.map((batch) => {
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
      location_id: batch.location_id,
      item_type: 'medication' as const,
      trade_name: medication.trade_name,
      active_ingredient: medication.active_ingredient,
      concentration: medication.concentration,
      batch_number: batch.batch_number,
      expiration_date: batch.expiration_date,
      packaging_unit: batch.packaging_unit,
      initial_quantity: batch.initial_quantity,
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

  const itemById = new Map(items.map((item) => [item.id, item]));
  const locationRows = itemBatches.map((batch) => {
    const item = itemById.get(batch.item_id);
    const location = locationById.get(batch.location_id);
    if (!item || !location) {
      throw new Error(
        `El registro de inventario ${batch.id} referencia un articulo o una ubicacion que no se pudo leer.`,
      );
    }

    const daysUntilExpiration = batch.expiration_date
      ? Math.floor(
        (new Date(`${batch.expiration_date}T00:00:00Z`).getTime() -
          new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`).getTime()) /
          86_400_000,
      )
      : null;

    return {
      id: batch.id,
      batch_id: batch.id,
      location_id: batch.location_id,
      item_type: item.item_type,
      trade_name: item.name,
      active_ingredient: '',
      concentration: item.unit,
      batch_number: batch.batch_number,
      expiration_date: batch.expiration_date,
      packaging_unit: null,
      initial_quantity: batch.initial_quantity,
      days_until_expiration: daysUntilExpiration,
      current_quantity: batch.current_quantity,
      location_code: location.location_code,
      zone: location.zone,
      requires_refrigeration: false,
      requires_prescription: false,
      status: daysUntilExpiration !== null && daysUntilExpiration < 0
        ? 'expired' as const
        : batch.status as BatchStatus,
      unit: item.unit,
    };
  });

  return { rows: [...medicationRows, ...locationRows], locations };
}

export async function loadWarehouseLocations(): Promise<WarehouseLocation[]> {
  const supabase = getSupabaseClient();
  const [locationsResponse, batchesResponse, medicationsResponse, itemBatchesResponse, itemsResponse] =
    await Promise.all([
      supabase.from('locations').select('*').order('zone').order('location_code'),
      supabase
        .from('batches')
        .select('id, batch_number, current_quantity, medication_id, location_id')
        .gt('current_quantity', 0),
      supabase.from('medications').select('*'),
      supabase
        .from('inventory_item_batches')
        .select('id, batch_number, current_quantity, item_id, location_id')
        .gt('current_quantity', 0),
      supabase.from('inventory_items').select('*'),
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
  const itemBatches = requireRows(
    itemBatchesResponse.data,
    itemBatchesResponse.error,
    'la tabla inventory_item_batches',
  );
  const items = requireRows(
    itemsResponse.data,
    itemsResponse.error,
    'la tabla inventory_items',
  );
  const medicationById = new Map(
    medications.map((medication) => [medication.id, medication]),
  );
  const itemById = new Map(items.map((item) => [item.id, item]));
  const medicationWarehouseBatches: WarehouseBatch[] = batches.map((batch) => {
    const medication = medicationById.get(batch.medication_id);
    if (!medication) {
      throw new Error(
        `El lote ${batch.batch_number} referencia un medicamento que no se pudo leer.`,
      );
    }

    return {
      id: batch.id,
      location_id: batch.location_id,
      batch_number: batch.batch_number,
      current_quantity: batch.current_quantity,
      medication,
      item_name: null,
      item_unit: null,
    };
  });
  const itemWarehouseBatches: WarehouseBatch[] = itemBatches.map((batch) => {
    const item = itemById.get(batch.item_id);
    if (!item) {
      throw new Error(
        `El registro de inventario ${batch.id} referencia un articulo que no se pudo leer.`,
      );
    }
    return {
      id: batch.id,
      location_id: batch.location_id,
      batch_number: batch.batch_number,
      current_quantity: batch.current_quantity,
      medication: null,
      item_name: item.name,
      item_unit: item.unit,
    };
  });

  return locations.map((location) => ({
    ...location,
    batches: [
      ...medicationWarehouseBatches.filter((batch) => batch.location_id === location.id),
      ...itemWarehouseBatches.filter((batch) => batch.location_id === location.id),
    ],
  }));
}

export async function loadMovementRows(): Promise<MovementRow[]> {
  const supabase = getSupabaseClient();
  const [movementsResponse, batchesResponse, medicationsResponse, donorsResponse, itemBatchesResponse, itemsResponse] =
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
      supabase.from('inventory_item_batches').select('id, batch_number, item_id, donor_id'),
      supabase.from('inventory_items').select('*'),
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
  const itemBatches = requireRows(
    itemBatchesResponse.data,
    itemBatchesResponse.error,
    'la tabla inventory_item_batches',
  );
  const items = requireRows(
    itemsResponse.data,
    itemsResponse.error,
    'la tabla inventory_items',
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
  const itemBatchById = new Map(itemBatches.map((batch) => [batch.id, batch]));
  const itemById = new Map(items.map((item) => [item.id, item]));
  const registrarNameById = new Map(
    registrarNames.map(({ user_id, full_name }) => [user_id, full_name]),
  );

  return movements.map((movement) => {
    const batch = movement.batch_id ? batchById.get(movement.batch_id) : undefined;
    const medication = batch
      ? medicationById.get(batch.medication_id)
      : undefined;
    const itemBatch = movement.item_batch_id
      ? itemBatchById.get(movement.item_batch_id)
      : undefined;
    const item = itemBatch ? itemById.get(itemBatch.item_id) : undefined;

    if ((!batch || !medication) && (!itemBatch || !item)) {
      throw new Error(
        `El movimiento ${movement.id} referencia un lote o articulo que no se pudo leer.`,
      );
    }

    return {
      ...movement,
      batch_number: batch?.batch_number ?? itemBatch?.batch_number ?? null,
      medication: medication ?? null,
      item: item ?? null,
      donor: batch?.donor_id || itemBatch?.donor_id
        ? donorById.get((batch?.donor_id ?? itemBatch?.donor_id)!) ?? null
        : null,
      registered_by_name: movement.registered_by
        ? registrarNameById.get(movement.registered_by) ?? null
        : null,
    };
  });
}

export async function loadDeliveryInventoryOptions(): Promise<DeliveryItemOption[]> {
  const supabase = getSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);
  const [batchesResponse, medicationsResponse, itemBatchesResponse, itemsResponse] = await Promise.all([
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
    supabase
      .from('inventory_item_batches')
      .select('id, item_id, current_quantity')
      .gt('current_quantity', 0)
      .or(`expiration_date.is.null,expiration_date.gte.${today}`)
      .eq('status', 'available'),
    supabase.from('inventory_items').select('*').order('name'),
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
  const itemBatches = requireRows(
    itemBatchesResponse.data,
    itemBatchesResponse.error,
    'los insumos y equipos disponibles para entrega',
  );
  const items = requireRows(
    itemsResponse.data,
    itemsResponse.error,
    'la tabla inventory_items',
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

  const medicationOptions = medications.flatMap((medication) => {
    const available = availableByMedication.get(medication.id);
    if (!available) {
      return [];
    }

    return [{
      id: medication.id,
      label: `${medication.trade_name} ${medication.concentration}`,
      item_type: 'medication' as const,
      active_ingredient: medication.active_ingredient,
      requires_prescription: medication.requires_prescription,
      available_quantity: available.quantity,
      batch_count: available.batches,
      batch_ids: available.ids,
    }];
  });

  const availableByItem = new Map<string, { quantity: number; batches: number; ids: string[] }>();
  itemBatches.forEach((batch) => {
    const current = availableByItem.get(batch.item_id) ?? { quantity: 0, batches: 0, ids: [] };
    current.quantity += batch.current_quantity;
    current.batches += 1;
    current.ids.push(batch.id);
    availableByItem.set(batch.item_id, current);
  });
  const otherOptions = items.flatMap((item) => {
    const available = availableByItem.get(item.id);
    if (!available) return [];
    return [{
      id: item.id,
      label: `${item.name} (${item.unit})`,
      item_type: item.item_type,
      active_ingredient: null,
      requires_prescription: false,
      available_quantity: available.quantity,
      batch_count: available.batches,
      batch_ids: available.ids,
    }];
  });
  return [...medicationOptions, ...otherOptions];
}

export async function loadDonationFormOptions(): Promise<DonationFormOptions> {
  const supabase = getSupabaseClient();
  const [donorsResponse, medicationsResponse, locationsResponse, inventoryItemsResponse] =
    await Promise.all([
      supabase.from('donors').select('*').order('name_or_company'),
      supabase.from('medications').select('*').order('trade_name'),
      supabase.from('locations').select('*').order('zone').order('location_code'),
      supabase.from('inventory_items').select('*').order('name'),
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
    inventoryItems: requireRows(
      inventoryItemsResponse.data,
      inventoryItemsResponse.error,
      'la tabla inventory_items',
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
