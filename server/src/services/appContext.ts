import { EntityResolutionService } from './entityResolution.js';
import { FraudGraphService } from './fraudGraph.js';
import { ClusterDetectionEngine } from './clusterDetection.js';
import { TransactionIngestionPipeline } from './transactionIngest.js';
import { getSelectedDataAdapter } from '../adapters/adapterFactory.js';
import { IDataAdapter } from '../adapters/IDataAdapter.js';

class AppContext {
  public dataAdapter!: IDataAdapter;
  public entityResolver!: EntityResolutionService;
  public graphService!: FraudGraphService;
  public clusterEngine!: ClusterDetectionEngine;
  public ingestPipeline!: TransactionIngestionPipeline;
  private isReady: boolean = false;

  async init(): Promise<void> {
    if (this.isReady) return;

    this.entityResolver = new EntityResolutionService();
    this.graphService = new FraudGraphService();
    this.dataAdapter = getSelectedDataAdapter();
    await this.dataAdapter.initialize();

    this.clusterEngine = new ClusterDetectionEngine(this.graphService, this.entityResolver);
    this.ingestPipeline = new TransactionIngestionPipeline(
      this.entityResolver,
      this.graphService,
      this.clusterEngine,
      this.dataAdapter
    );

    // Initial cluster detection run
    const txns = await this.dataAdapter.getTransactions();
    const incidents = await this.dataAdapter.getFraudIncidents();
    this.clusterEngine.detectClusters(txns, incidents);

    this.isReady = true;
    console.log(`[AppContext] Initialized successfully with adapter: ${this.dataAdapter.adapterName}`);
  }

  async reload(): Promise<void> {
    if (this.dataAdapter.reloadData) {
      await this.dataAdapter.reloadData();
    }
    const txns = await this.dataAdapter.getTransactions();
    const incidents = await this.dataAdapter.getFraudIncidents();
    this.clusterEngine.detectClusters(txns, incidents);
  }
}

export const appContext = new AppContext();
