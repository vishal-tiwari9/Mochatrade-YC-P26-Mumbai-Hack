"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appContext = void 0;
const entityResolution_js_1 = require("./entityResolution.js");
const fraudGraph_js_1 = require("./fraudGraph.js");
const clusterDetection_js_1 = require("./clusterDetection.js");
const transactionIngest_js_1 = require("./transactionIngest.js");
const adapterFactory_js_1 = require("../adapters/adapterFactory.js");
class AppContext {
    dataAdapter;
    entityResolver;
    graphService;
    clusterEngine;
    ingestPipeline;
    isReady = false;
    async init() {
        if (this.isReady)
            return;
        this.entityResolver = new entityResolution_js_1.EntityResolutionService();
        this.graphService = new fraudGraph_js_1.FraudGraphService();
        this.dataAdapter = (0, adapterFactory_js_1.getSelectedDataAdapter)();
        await this.dataAdapter.initialize();
        this.clusterEngine = new clusterDetection_js_1.ClusterDetectionEngine(this.graphService, this.entityResolver);
        this.ingestPipeline = new transactionIngest_js_1.TransactionIngestionPipeline(this.entityResolver, this.graphService, this.clusterEngine, this.dataAdapter);
        // Initial cluster detection run
        const txns = await this.dataAdapter.getTransactions();
        const incidents = await this.dataAdapter.getFraudIncidents();
        this.clusterEngine.detectClusters(txns, incidents);
        this.isReady = true;
        console.log(`[AppContext] Initialized successfully with adapter: ${this.dataAdapter.adapterName}`);
    }
    async reload() {
        if (this.dataAdapter.reloadData) {
            await this.dataAdapter.reloadData();
        }
        const txns = await this.dataAdapter.getTransactions();
        const incidents = await this.dataAdapter.getFraudIncidents();
        this.clusterEngine.detectClusters(txns, incidents);
    }
}
exports.appContext = new AppContext();
