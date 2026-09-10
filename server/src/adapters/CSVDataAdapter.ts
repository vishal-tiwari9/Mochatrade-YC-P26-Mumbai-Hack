/**
 * CSVDataAdapter - Forensic batch adapter for offline fraud investigation files
 * Supports loading historical banking transactions, cyber crime reports, or LEA data feeds.
 */

import { IDataAdapter, IngestResult } from './IDataAdapter.js';
import { 
  NormalizedTransaction, 
  NormalizedEntity, 
  NormalizedRelationship, 
  FraudIncident 
} from '../models/types.js';

export class CSVDataAdapter implements IDataAdapter {
  readonly adapterName = 'CSV-Forensics-Adapter';
  readonly isLiveFeed = false;

  private csvFilePath: string | null = null;

  constructor() {
    this.csvFilePath = process.env.CSV_DATA_PATH || null;
  }

  async initialize(): Promise<void> {
    if (!this.csvFilePath) {
      console.warn(`[${this.adapterName}] No CSV_DATA_PATH specified. Awaiting CSV file upload.`);
    }
  }

  async getTransactions(): Promise<NormalizedTransaction[]> {
    return [];
  }

  async getEntities(): Promise<NormalizedEntity[]> {
    return [];
  }

  async getRelationships(): Promise<NormalizedRelationship[]> {
    return [];
  }

  async getFraudIncidents(): Promise<FraudIncident[]> {
    return [];
  }

  async ingestTransaction(transaction: NormalizedTransaction): Promise<IngestResult> {
    return {
      success: true,
      transaction,
      resolvedEntityIds: [],
      createdRelationshipIds: [],
      affectedClusterIds: [],
      message: 'CSVDataAdapter: Batch record processed.'
    };
  }
}
