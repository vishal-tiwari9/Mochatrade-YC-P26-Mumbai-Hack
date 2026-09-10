"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemRouter = void 0;
const express_1 = require("express");
const adapterFactory_js_1 = require("../adapters/adapterFactory.js");
const appContext_js_1 = require("../services/appContext.js");
const auditLogger_js_1 = require("../services/auditLogger.js");
exports.systemRouter = (0, express_1.Router)();
/**
 * GET /api/data-source/status
 * Returns active adapter and status of available production-ready adapters
 */
exports.systemRouter.get('/status', async (_req, res) => {
    try {
        const adapters = (0, adapterFactory_js_1.getAvailableAdaptersStatus)();
        const activeAdapter = appContext_js_1.appContext.dataAdapter.adapterName;
        res.json({
            success: true,
            data: {
                activeAdapter,
                dataSourceEnv: process.env.DATA_SOURCE || 'demo',
                isLiveFeed: appContext_js_1.appContext.dataAdapter.isLiveFeed,
                availableAdapters: adapters,
                totalEntitiesTracked: appContext_js_1.appContext.entityResolver.getAllEntities().length,
                totalEdgesTracked: appContext_js_1.appContext.graphService.getAllEdges().length
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/audit/logs
 * Returns investigator audit trail
 */
exports.systemRouter.get('/audit/logs', async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 50;
        const logs = auditLogger_js_1.auditLogger.getRecentLogs(limit);
        res.json({
            success: true,
            data: logs
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/audit/log
 * Logs investigator action
 */
exports.systemRouter.post('/audit/log', async (req, res) => {
    try {
        const { action, actor, clusterId, details } = req.body;
        const entry = auditLogger_js_1.auditLogger.logAction(action, actor, clusterId, details);
        res.json({
            success: true,
            data: entry
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
