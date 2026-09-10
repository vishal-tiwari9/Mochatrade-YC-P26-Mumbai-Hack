"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionIngestionPipeline = void 0;
const auditLogger_js_1 = require("./auditLogger.js");
class TransactionIngestionPipeline {
    entityResolver;
    graphService;
    clusterEngine;
    dataAdapter;
    constructor(entityResolver, graphService, clusterEngine, dataAdapter) {
        this.entityResolver = entityResolver;
        this.graphService = graphService;
        this.clusterEngine = clusterEngine;
        this.dataAdapter = dataAdapter;
    }
    /**
     * Complete 8-step pipeline:
     * 1. Ingest transaction
     * 2. Normalize it
     * 3. Resolve entities
     * 4. Add relationships
     * 5. Update the graph
     * 6. Recalculate affected clusters
     * 7. Update cluster risk
     * 8. Identify newly connected entities
     */
    async processIncomingTransaction(rawTxn) {
        // 1 & 2. Ingest and Normalize
        const normalized = {
            transactionId: rawTxn.transactionId || `TXN_SIM_${Date.now()}`,
            timestamp: rawTxn.timestamp || new Date().toISOString(),
            senderAccountId: rawTxn.senderAccountId || 'ACC_2841_18',
            receiverAccountId: rawTxn.receiverAccountId || 'ACC_2841_01',
            senderUpiId: rawTxn.senderUpiId || 'mule_new@upi',
            receiverUpiId: rawTxn.receiverUpiId || 'syndicate_01@upi',
            deviceId: rawTxn.deviceId || 'DEV_2841_ALPHA',
            phoneHash: rawTxn.phoneHash || 'HASH_PH_9841A',
            amount: rawTxn.amount || 14500,
            currency: rawTxn.currency || 'INR',
            merchantId: rawTxn.merchantId,
            beneficiaryId: rawTxn.beneficiaryId || 'BENE_MULE_HQ_01',
            channel: rawTxn.channel || 'UPI',
            status: rawTxn.status || 'SUCCESS',
            location: rawTxn.location || {
                city: 'Mumbai',
                state: 'Maharashtra',
                ipHash: 'IP_HASH_MUM_SIM'
            }
        };
        // 3. Resolve Entities
        const senderAcc = this.entityResolver.getOrCreateEntity('ACCOUNT', normalized.senderAccountId, normalized.timestamp, 45);
        const receiverAcc = this.entityResolver.getOrCreateEntity('ACCOUNT', normalized.receiverAccountId, normalized.timestamp, 45);
        const resolvedEntityIds = [senderAcc.id, receiverAcc.id];
        this.graphService.addNode(senderAcc);
        this.graphService.addNode(receiverAcc);
        // 4 & 5. Add relationships and update graph
        const createdRelationshipIds = [];
        // Financial edge
        const finRel = this.graphService.addEdge(senderAcc.id, receiverAcc.id, 'SENT_TO', normalized.timestamp, 0.99, { amount: normalized.amount, channel: normalized.channel, transactionId: normalized.transactionId });
        createdRelationshipIds.push(finRel.id);
        // UPI
        if (normalized.senderUpiId) {
            const upi = this.entityResolver.getOrCreateEntity('UPI', normalized.senderUpiId, normalized.timestamp, 30);
            this.graphService.addNode(upi);
            const rel = this.graphService.addEdge(senderAcc.id, upi.id, 'OWNS', normalized.timestamp, 0.98);
            resolvedEntityIds.push(upi.id);
            createdRelationshipIds.push(rel.id);
        }
        // Device sharing linkage
        if (normalized.deviceId) {
            const dev = this.entityResolver.getOrCreateEntity('DEVICE', normalized.deviceId, normalized.timestamp, 40);
            this.graphService.addNode(dev);
            const rel = this.graphService.addEdge(senderAcc.id, dev.id, 'USES', normalized.timestamp, 0.95);
            resolvedEntityIds.push(dev.id);
            createdRelationshipIds.push(rel.id);
            // Shared device with existing accounts using DEV_2841_ALPHA
            const sharedDevRel = this.graphService.addEdge(senderAcc.id, 'ACCOUNT:ACC_2841_01', 'SHARED_DEVICE', normalized.timestamp, 0.99, { deviceId: dev.id, note: 'New account activated on syndicate device DEV_2841_ALPHA' });
            createdRelationshipIds.push(sharedDevRel.id);
        }
        // Phone sharing linkage
        if (normalized.phoneHash) {
            const phone = this.entityResolver.getOrCreateEntity('PHONE', normalized.phoneHash, normalized.timestamp, 40);
            this.graphService.addNode(phone);
            const rel = this.graphService.addEdge(senderAcc.id, phone.id, 'USES', normalized.timestamp, 0.95);
            resolvedEntityIds.push(phone.id);
            createdRelationshipIds.push(rel.id);
        }
        // Pass to data adapter
        await this.dataAdapter.ingestTransaction(normalized);
        // 6 & 7. Recalculate affected clusters
        // Re-run detection to recalculate cluster metrics dynamically
        const allTxns = await this.dataAdapter.getTransactions();
        const allIncidents = await this.dataAdapter.getFraudIncidents();
        const clusters = this.clusterEngine.detectClusters(allTxns, allIncidents);
        // Find affected cluster (typically FNX-CL-2841)
        const affectedCluster = clusters.find((c) => c.entityIds.includes(senderAcc.id) || c.entityIds.includes(receiverAcc.id)) || clusters[0];
        // 8. Identify newly connected entities
        const newlyConnected = resolvedEntityIds.filter(id => id.includes(normalized.senderAccountId));
        auditLogger_js_1.auditLogger.logAction('TRANSACTION_INGESTED', 'SIMULATION_ENGINE', affectedCluster?.clusterId, {
            transactionId: normalized.transactionId,
            amount: normalized.amount,
            sender: normalized.senderAccountId,
            receiver: normalized.receiverAccountId,
            deviceId: normalized.deviceId,
            newRiskScore: affectedCluster?.riskScore
        });
        return {
            result: {
                success: true,
                transaction: normalized,
                resolvedEntityIds,
                createdRelationshipIds,
                affectedClusterIds: affectedCluster ? [affectedCluster.clusterId] : [],
                message: `Transaction ${normalized.transactionId} processed. Cluster ${affectedCluster?.clusterId} updated.`
            },
            updatedCluster: affectedCluster,
            newlyConnectedEntities: newlyConnected
        };
    }
}
exports.TransactionIngestionPipeline = TransactionIngestionPipeline;
