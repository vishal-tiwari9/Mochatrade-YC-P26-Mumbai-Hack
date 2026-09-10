import { Router, Request, Response } from 'express';
import { getAvailableAdaptersStatus } from '../adapters/adapterFactory.js';
import { appContext } from '../services/appContext.js';
import { auditLogger } from '../services/auditLogger.js';

export const systemRouter = Router();

/**
 * GET /api/data-source/status
 * Returns active adapter and status of available production-ready adapters
 */
systemRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const adapters = getAvailableAdaptersStatus();
    const activeAdapter = appContext.dataAdapter.adapterName;

    res.json({
      success: true,
      data: {
        activeAdapter,
        dataSourceEnv: process.env.DATA_SOURCE || 'demo',
        isLiveFeed: appContext.dataAdapter.isLiveFeed,
        availableAdapters: adapters,
        totalEntitiesTracked: appContext.entityResolver.getAllEntities().length,
        totalEdgesTracked: appContext.graphService.getAllEdges().length
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/audit/logs
 * Returns investigator audit trail
 */
systemRouter.get('/audit/logs', async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const logs = auditLogger.getRecentLogs(limit);
    res.json({
      success: true,
      data: logs
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/audit/log
 * Logs investigator action
 */
systemRouter.post('/audit/log', async (req: Request, res: Response) => {
  try {
    const { action, actor, clusterId, details } = req.body;
    const entry = auditLogger.logAction(action, actor, clusterId, details);
    res.json({
      success: true,
      data: entry
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
