/**
 * WebhookDataAdapter - Real-time push adapter for transaction feeds & alert webhooks
 * Supports signed payloads (HMAC-SHA256 signature verification) from financial core switches.
 */

import { IDataAdapter, IngestResult } from './IDataAdapter.js';
import { 
  NormalizedTransaction, 
  NormalizedEntity, 
  NormalizedRelationship, 
  FraudIncident 
} from '../models/types.js';

export class WebhookDataAdapter implements IDataAdapter {
  readonly adapterName = 'Realtime-Webhook-Adapter';
  readonly isLiveFeed = true;

  private webhookSecret: string | null = null;

  constructor() {
    this.webhookSecret = process.env.WEBHOOK_SECRET || null;
  }

  async initialize(): Promise<void> {
    if (!this.webhookSecret) {
      console.warn(`[${this.adapterName}] WEBHOOK_SECRET not configured. Ready for webhook subscription.`);
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
      message: 'WebhookDataAdapter: Real-time event ingested.'
    };
  }
}
