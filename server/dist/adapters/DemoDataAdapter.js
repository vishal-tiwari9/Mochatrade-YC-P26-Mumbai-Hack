"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoDataAdapter = void 0;
const dataGenerator_js_1 = require("../services/dataGenerator.js");
const entityResolution_js_1 = require("../services/entityResolution.js");
const fraudGraph_js_1 = require("../services/fraudGraph.js");
class DemoDataAdapter {
    adapterName = 'Local-Synthetic-Demo-Adapter';
    isLiveFeed = false;
    transactions = [];
    fraudIncidents = [];
    entityResolver;
    graphService;
    constructor(entityResolver, graphService) {
        this.entityResolver = entityResolver || new entityResolution_js_1.EntityResolutionService();
        this.graphService = graphService || new fraudGraph_js_1.FraudGraphService();
    }
    async initialize() {
        const dataset = (0, dataGenerator_js_1.generateSyntheticDataset)();
        this.transactions = dataset.transactions;
        this.fraudIncidents = dataset.fraudIncidents;
    }
    async reloadData() {
        await this.initialize();
    }
    async getTransactions() {
        if (this.transactions.length === 0) {
            await this.initialize();
        }
        return this.transactions;
    }
    async getEntities() {
        return this.entityResolver.getAllEntities();
    }
    async getRelationships() {
        return this.graphService.getAllEdges();
    }
    async getFraudIncidents() {
        if (this.fraudIncidents.length === 0) {
            await this.initialize();
        }
        return this.fraudIncidents;
    }
    async ingestTransaction(transaction) {
        this.transactions.push(transaction);
        // Resolve entities
        const sender = this.entityResolver.getOrCreateEntity('ACCOUNT', transaction.senderAccountId, transaction.timestamp);
        const receiver = this.entityResolver.getOrCreateEntity('ACCOUNT', transaction.receiverAccountId, transaction.timestamp);
        const resolvedIds = [sender.id, receiver.id];
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
exports.DemoDataAdapter = DemoDataAdapter;
