import type {
  Batch,
  BatchItemFEFO,
  Donor,
  Location,
  Medication,
  Movement,
} from './inventory';

type TableDefinition<Row> = {
  Row: Row & Record<string, unknown>;
  Insert: Partial<Row> & Record<string, unknown>;
  Update: Partial<Row> & Record<string, unknown>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      locations: TableDefinition<Location>;
      medications: TableDefinition<Medication>;
      donors: TableDefinition<Donor>;
      batches: TableDefinition<Batch>;
      movements: TableDefinition<Movement>;
    };
    Views: {
      view_inventory_fefo: {
        Row: BatchItemFEFO & Record<string, unknown>;
        Relationships: [];
      };
    };
    Functions: {
      deliver_medication_fefo: {
        Args: {
          p_medication_id: string;
          p_quantity: number;
          p_destination_or_beneficiary: string;
          p_motive_or_observation?: string | null;
        };
        Returns: {
          batch_id: string;
          batch_number: string;
          quantity: number;
        }[];
      };
      register_donation: {
        Args: {
          p_donor_id: string | null;
          p_donor_name: string;
          p_donor_phone: string | null;
          p_donor_email: string | null;
          p_donor_type: string;
          p_medication_id: string | null;
          p_trade_name: string;
          p_active_ingredient: string;
          p_concentration: string;
          p_pharmaceutical_form: Medication['pharmaceutical_form'];
          p_requires_refrigeration: boolean;
          p_requires_prescription: boolean;
          p_location_id: string;
          p_batch_number: string;
          p_expiration_date: string;
          p_quantity: number;
          p_observations: string | null;
        };
        Returns: {
          batch_id: string;
          batch_number: string;
          quantity: number;
          status: NonNullable<Batch['status']>;
        }[];
      };
    };
    Enums: {
      pharmaceutical_form_enum: Medication['pharmaceutical_form'];
      batch_status_enum: NonNullable<Batch['status']>;
      movement_type_enum: Movement['type'];
    };
    CompositeTypes: Record<string, never>;
  };
}
