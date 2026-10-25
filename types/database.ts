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
    };
    Enums: {
      pharmaceutical_form_enum: Medication['pharmaceutical_form'];
      batch_status_enum: NonNullable<Batch['status']>;
      movement_type_enum: Movement['type'];
    };
    CompositeTypes: Record<string, never>;
  };
}
