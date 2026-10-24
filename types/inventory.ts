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

export interface Donor {
  id: string;
  name_or_company: string;
  contact_phone: string | null;
  contact_email: string | null;
  donor_type: string;
  created_at: string;
}

export interface Batch {
  id: string;
  medication_id: string;
  donor_id: string | null;
  location_id: string;
  batch_number: string;
  expiration_date: string;
  initial_quantity: number;
  current_quantity: number;
  status: BatchStatus | null;
  observations: string | null;
  created_at: string;
}

export interface Movement {
  id: string;
  batch_id: string;
  type: MovementType;
  quantity: number;
  destination_or_beneficiary: string | null;
  registered_by: string | null;
  motive_or_observation: string | null;
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