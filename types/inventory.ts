// types/inventory.ts

export type PharmaceuticalForm =
  | 'tablet_pill'
  | 'capsule'
  | 'syrup_suspension'
  | 'injectable_ampoule'
  | 'cream_ointment'
  | 'drops'
  | 'inhaler'
  | 'other';

export type BatchStatus =
  | 'available'
  | 'expiring_soon'
  | 'expired'
  | 'out_of_stock'
  | 'quarantine';

export type MovementType =
  | 'donation_entry'
  | 'donation_exit'
  | 'inventory_adjustment'
  | 'expired_discard';

export interface Location {
  id: string;
  zone: string;
  shelf_unit: string;
  tier_bin: string;
  location_code: string;
  description?: string;
  created_at: string;
}

export interface Medication {
  id: string;
  trade_name: string;
  active_ingredient: string;
  concentration: string;
  pharmaceutical_form: PharmaceuticalForm;
  requires_refrigeration: boolean;
  requires_prescription: boolean;
  created_at: string;
}

export interface BatchItemFEFO {
  batch_id: string;
  trade_name: string;
  active_ingredient: string;
  concentration: string;
  batch_number: string;
  expiration_date: string;
  days_until_expiration: number;
  current_quantity: number;
  location_code: string;
  zone: string;
  requires_refrigeration: boolean;
}