import { IDataAdapter, IngestResult } from './IDataAdapter.js';
import { 
  NormalizedTransaction, 
  NormalizedEntity, 
  NormalizedRelationship, 
  FraudIncident 
} from '../models/types.js';
import { generateSyntheticDataset } from '../services/dataGenerator.js';
import { EntityResolutionService } from '../services/entityResolution.js';
import { FraudGraphService } from '../services/fraudGraph.js';

export class DemoDataAdapter implements IDataAdapter {
  readonly adapterName = 'Local-Synthetic-Demo-Adapter';
  readonly isLiveFeed = false;

  private transactions: NormalizedTransaction[] = [];
  private fraudIncidents: FraudIncident[] = [];
  private entityResolver: EntityResolutionService;
  private graphService: FraudGraphService;

  constructor(entityResolver?: EntityResolutionService, graphService?: FraudGraphService) {
    this.entityResolver = entityResolver || new EntityResolutionService();
    this.graphService = graphService || new FraudGraphService();
  }

  async initialize(): Promise<void> {
    const dataset = generateSyntheticDataset();
    this.transactions = dataset.transactions;
    this.fraudIncidents = dataset.fraudIncidents;
  }

  async reloadData(): Promise<void> {
    await this.initialize();
  }

  async getTransactions(): Promise<NormalizedTransaction[]> {
    if (this.transactions.length === 0) {
      await this.initialize();
    }
    return this.transactions;
  }

  async getEntities(): Promise<NormalizedEntity[]> {
    return this.entityResolver.getAllEntities();
  }

  async getRelationships(): Promise<NormalizedRelationship[]> {
    return this.graphService.getAllEdges();
  }

  async getFraudIncidents(): Promise<FraudIncident[]> {
    if (this.fraudIncidents.length === 0) {
      await this.initialize();
    }
    return this.fraudIncidents;
  }

  async ingestTransaction(transaction: NormalizedTransaction): Promise<IngestResult> {
    this.transactions.push(transaction);

    // Resolve entities
    const sender = this.entityResolver.getOrCreateEntity('ACCOUNT', transaction.senderAccountId, transaction.timestamp);
    const receiver = this.entityResolver.getOrCreateEntity('ACCOUNT', transaction.receiverAccountId, transaction.timestamp);
    const resolvedIds: string[] = [sender.id, receiver.id];

    if (transaction.deviceId) {
      const dev = this.entityResolver.getOrCreateEntity('DEVICE', transaction.deviceId, transaction.timestamp);
      resolvedIds.push(dev.id);
    }
    if (transaction.phoneHash) {
      const ph = this.entityResolver.getOrCreateEntity('PHONE', transaction.phoneHash, transaction.timestamp);
      resolvedIds.push(ph.id);
    }
    if (transaction.senderUpiId) {
      const upi = this.entityResolver.getOrCreateEntity('UPI', transaction.senderUpiId, transaction.timestamp);
      resolvedIds.push(upi.id);
    }

    return {
      success: true,
      transaction,
      resolvedEntityIds: resolvedIds,
      createdRelationshipIds: [],
      affectedClusterIds: ['FNX-CL-2841'],
      message: 'Transaction successfully ingested and routed through detection pipeline.'
    };
  }
}
