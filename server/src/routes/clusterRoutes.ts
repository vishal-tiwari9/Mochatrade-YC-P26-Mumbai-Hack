import { Router, Request, Response } from 'express';
import { appContext } from '../services/appContext.js';
import { auditLogger } from '../services/auditLogger.js';

export const clusterRouter = Router();

/**
 * GET /api/fraud-clusters
 * Returns list of all detected fraud clusters with filters
 */
clusterRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { riskLevel, minScore, status, search } = req.query;
    let clusters = appContext.clusterEngine.getAllClusters();

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
      clusters = clusters.filter(c => 
        c.clusterId.toLowerCase().includes(q) ||
        c.entityIds.some(id => id.toLowerCase().includes(q))
      );
    }

    // Top KPIs calculation
    const allClusters = appContext.clusterEngine.getAllClusters();
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/fraud-clusters/:clusterId
 * Detailed view of single cluster
 */
clusterRouter.get('/:clusterId', async (req: Request, res: Response) => {
  try {
    const clusterId = String(req.params.clusterId);
    const cluster = appContext.clusterEngine.getCluster(clusterId);

    if (!cluster) {
      return res.status(404).json({ success: false, error: `Cluster ${clusterId} not found` });
    }

    auditLogger.logAction('VIEW_CLUSTER_DETAILS', 'INVESTIGATOR', clusterId, { riskScore: cluster.riskScore });

    res.json({
      success: true,
      data: cluster
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/fraud-clusters/:clusterId/network
 * Cytoscape graph nodes and edges for this cluster
 */
clusterRouter.get('/:clusterId/network', async (req: Request, res: Response) => {
  try {
    const clusterId = String(req.params.clusterId);
    const cluster = appContext.clusterEngine.getCluster(clusterId);

    if (!cluster) {
      return res.status(404).json({ success: false, error: `Cluster ${clusterId} not found` });
    }

    const nodeIds = new Set(cluster.entityIds);
    const graphData = appContext.graphService.exportCytoscapeSubgraph(nodeIds, clusterId);

    res.json({
      success: true,
      data: graphData
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/fraud-clusters/:clusterId/entities
 * List of entities in this cluster
 */
clusterRouter.get('/:clusterId/entities', async (req: Request, res: Response) => {
  try {
    const clusterId = String(req.params.clusterId);
    const cluster = appContext.clusterEngine.getCluster(clusterId);

    if (!cluster) {
      return res.status(404).json({ success: false, error: `Cluster ${clusterId} not found` });
    }

    const entities = cluster.entityIds
      .map(id => appContext.graphService.getNode(id))
      .filter(Boolean);

    res.json({
      success: true,
      data: entities
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/fraud-clusters/:clusterId/transactions
 * List of transactions associated with this cluster
 */
clusterRouter.get('/:clusterId/transactions', async (req: Request, res: Response) => {
  try {
    const clusterId = String(req.params.clusterId);
    const cluster = appContext.clusterEngine.getCluster(clusterId);

    if (!cluster) {
      return res.status(404).json({ success: false, error: `Cluster ${clusterId} not found` });
    }

    const allTxns = await appContext.dataAdapter.getTransactions();
    const clusterTxns = allTxns.filter(t => cluster.transactionIds.includes(t.transactionId));

    res.json({
      success: true,
      data: clusterTxns
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/fraud-clusters/:clusterId/growth
 * Dynamic time-series growth data generated from transaction timestamps
 */
clusterRouter.get('/:clusterId/growth', async (req: Request, res: Response) => {
  try {
    const clusterId = String(req.params.clusterId);
    const cluster = appContext.clusterEngine.getCluster(clusterId);

    if (!cluster) {
      return res.status(404).json({ success: false, error: `Cluster ${clusterId} not found` });
    }

    const allTxns = await appContext.dataAdapter.getTransactions();
    const growthData = appContext.clusterEngine.generateGrowthTimeSeries(clusterId, allTxns);

    res.json({
      success: true,
      data: growthData
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/fraud-clusters/:clusterId/contract
 * Section 20 Integration Contract Output Object
 */
clusterRouter.get('/:clusterId/contract', async (req: Request, res: Response) => {
  try {
    const clusterId = String(req.params.clusterId);
    const contract = appContext.clusterEngine.getIntegrationContract(clusterId);

    if (!contract) {
      return res.status(404).json({ success: false, error: `Cluster ${clusterId} not found` });
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/fraud-clusters/:clusterId/shortest-path
 * Query shortest path between two nodes in the cluster
 */
clusterRouter.get('/:clusterId/shortest-path', async (req: Request, res: Response) => {
  try {
    const { startId, endId } = req.query;
    if (!startId || !endId) {
      return res.status(400).json({ success: false, error: 'startId and endId query params required' });
    }

    const pathResult = appContext.graphService.findShortestPath(String(startId), String(endId));
    res.json({
      success: true,
      data: pathResult
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
