import { 
  NormalizedTransaction, 
  NormalizedEntity, 
  NormalizedRelationship, 
  FraudIncident 
} from '../models/types.js';

export interface IngestResult {
  success: boolean;
  transaction: NormalizedTransaction;
  resolvedEntityIds: string[];
  createdRelationshipIds: string[];
  affectedClusterIds: string[];
  message: string;
}

export interface IDataAdapter {
  readonly adapterName: string;
  readonly isLiveFeed: boolean;
  
  initialize(): Promise<void>;
  getTransactions(): Promise<NormalizedTransaction[]>;
  getEntities(): Promise<NormalizedEntity[]>;
  getRelationships(): Promise<NormalizedRelationship[]>;
  getFraudIncidents(): Promise<FraudIncident[]>;
  ingestTransaction(transaction: NormalizedTransaction): Promise<IngestResult>;
  reloadData?(): Promise<void>;
}
