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
    Functions: Record<string, never>;
    Enums: {
      pharmaceutical_form_enum: Medication['pharmaceutical_form'];
      batch_status_enum: NonNullable<Batch['status']>;
      movement_type_enum: Movement['type'];
    };
    CompositeTypes: Record<string, never>;
  };
}
