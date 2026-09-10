"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clusterRouter = void 0;
const express_1 = require("express");
const appContext_js_1 = require("../services/appContext.js");
const auditLogger_js_1 = require("../services/auditLogger.js");
exports.clusterRouter = (0, express_1.Router)();
/**
 * GET /api/fraud-clusters
 * Returns list of all detected fraud clusters with filters
 */
exports.clusterRouter.get('/', async (req, res) => {
    try {
        const { riskLevel, minScore, status, search } = req.query;
        let clusters = appContext_js_1.appContext.clusterEngine.getAllClusters();
        if (riskLevel) {
            clusters = clusters.filter(c => c.riskLevel.toUpperCase() === String(riskLevel).toUpperCase());
        }
        if (minScore) {
            const min = Number(minScore);
            if (!isNaN(min)) {
                clusters = clusters.filter(c => c.riskScore >= min);
            }
        }
        if (status) {
            clusters = clusters.filter(c => c.status.toUpperCase() === String(status).toUpperCase());
        }
        if (search) {
            const q = String(search).toLowerCase();
            clusters = clusters.filter(c => c.clusterId.toLowerCase().includes(q) ||
                c.entityIds.some(id => id.toLowerCase().includes(q)));
        }
        // Top KPIs calculation
        const allClusters = appContext_js_1.appContext.clusterEngine.getAllClusters();
        const activeClusters = allClusters.filter(c => c.status === 'ACTIVE').length;
        const criticalClusters = allClusters.filter(c => c.riskLevel === 'CRITICAL').length;
        const connectedEntities = allClusters.reduce((sum, c) => sum + c.entityCount, 0);
        const suspiciousTransactions = allClusters.reduce((sum, c) => sum + c.transactionCount, 0);
        const suspiciousExposure = allClusters.reduce((sum, c) => sum + c.exposure, 0);
        res.json({
            success: true,
            data: {
                kpis: {
                    activeClusters,
                    criticalClusters,
                    newlyDetected: 1,
                    connectedEntities,
                    suspiciousTransactions,
                    suspiciousExposure
                },
                clusters
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/fraud-clusters/:clusterId
 * Detailed view of single cluster
 */
exports.clusterRouter.get('/:clusterId', async (req, res) => {
    try {
        const clusterId = String(req.params.clusterId);
        const cluster = appContext_js_1.appContext.clusterEngine.getCluster(clusterId);
        if (!cluster) {
            return res.status(404).json({ success: false, error: `Cluster ${clusterId} not found` });
        }
        auditLogger_js_1.auditLogger.logAction('VIEW_CLUSTER_DETAILS', 'INVESTIGATOR', clusterId, { riskScore: cluster.riskScore });
        res.json({
            success: true,
            data: cluster
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/fraud-clusters/:clusterId/network
 * Cytoscape graph nodes and edges for this cluster
 */
exports.clusterRouter.get('/:clusterId/network', async (req, res) => {
    try {
        const clusterId = String(req.params.clusterId);
        const cluster = appContext_js_1.appContext.clusterEngine.getCluster(clusterId);
        if (!cluster) {
            return res.status(404).json({ success: false, error: `Cluster ${clusterId} not found` });
        }
        const nodeIds = new Set(cluster.entityIds);
        const graphData = appContext_js_1.appContext.graphService.exportCytoscapeSubgraph(nodeIds, clusterId);
        res.json({
            success: true,
            data: graphData
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/fraud-clusters/:clusterId/entities
 * List of entities in this cluster
 */
exports.clusterRouter.get('/:clusterId/entities', async (req, res) => {
    try {
        const clusterId = String(req.params.clusterId);
        const cluster = appContext_js_1.appContext.clusterEngine.getCluster(clusterId);
        if (!cluster) {
            return res.status(404).json({ success: false, error: `Cluster ${clusterId} not found` });
        }
        const entities = cluster.entityIds
            .map(id => appContext_js_1.appContext.graphService.getNode(id))
            .filter(Boolean);
        res.json({
            success: true,
            data: entities
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/fraud-clusters/:clusterId/transactions
 * List of transactions associated with this cluster
 */
exports.clusterRouter.get('/:clusterId/transactions', async (req, res) => {
    try {
        const clusterId = String(req.params.clusterId);
        const cluster = appContext_js_1.appContext.clusterEngine.getCluster(clusterId);
        if (!cluster) {
            return res.status(404).json({ success: false, error: `Cluster ${clusterId} not found` });
        }
        const allTxns = await appContext_js_1.appContext.dataAdapter.getTransactions();
        const clusterTxns = allTxns.filter(t => cluster.transactionIds.includes(t.transactionId));
        res.json({
            success: true,
            data: clusterTxns
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/fraud-clusters/:clusterId/growth
 * Dynamic time-series growth data generated from transaction timestamps
 */
exports.clusterRouter.get('/:clusterId/growth', async (req, res) => {
    try {
        const clusterId = String(req.params.clusterId);
        const cluster = appContext_js_1.appContext.clusterEngine.getCluster(clusterId);
        if (!cluster) {
            return res.status(404).json({ success: false, error: `Cluster ${clusterId} not found` });
        }
        const allTxns = await appContext_js_1.appContext.dataAdapter.getTransactions();
        const growthData = appContext_js_1.appContext.clusterEngine.generateGrowthTimeSeries(clusterId, allTxns);
        res.json({
            success: true,
            data: growthData
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/fraud-clusters/:clusterId/contract
 * Section 20 Integration Contract Output Object
 */
exports.clusterRouter.get('/:clusterId/contract', async (req, res) => {
    try {
        const clusterId = String(req.params.clusterId);
        const contract = appContext_js_1.appContext.clusterEngine.getIntegrationContract(clusterId);
        if (!contract) {
            return res.status(404).json({ success: false, error: `Cluster ${clusterId} not found` });
        }
        res.json({
            success: true,
            data: contract
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/fraud-clusters/:clusterId/shortest-path
 * Query shortest path between two nodes in the cluster
 */
exports.clusterRouter.get('/:clusterId/shortest-path', async (req, res) => {
    try {
        const { startId, endId } = req.query;
        if (!startId || !endId) {
            return res.status(400).json({ success: false, error: 'startId and endId query params required' });
        }
        const pathResult = appContext_js_1.appContext.graphService.findShortestPath(String(startId), String(endId));
        res.json({
            success: true,
            data: pathResult
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
