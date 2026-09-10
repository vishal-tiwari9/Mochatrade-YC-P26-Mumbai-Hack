"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRouter = createApiRouter;
const express_1 = require("express");
const AdapterFactory_1 = require("../adapters/AdapterFactory");
function createApiRouter(adapter, graph, traceEngine, simulationService) {
    const router = (0, express_1.Router)();
    const auditLogs = [
        {
            id: 'LOG-001',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            action: 'GRAPH_INITIALIZED',
            target: 'TransactionGraph',
            details: { totalNodes: graph.getAllNodes().length, totalEdges: graph.getAllTransactions().length },
            investigatorId: 'INV-SYSTEM'
        }
    ];
    function logAudit(action, target, details) {
        auditLogs.unshift({
            id: `LOG-${String(auditLogs.length + 1).padStart(3, '0')}`,
            timestamp: new Date().toISOString(),
            action,
            target,
            details,
            investigatorId: 'INV-DEMO-AGENT'
        });
        if (auditLogs.length > 50)
            auditLogs.pop();
    }
    // Cache of traced paths in memory for fast lookup by pathId
    const pathCache = new Map();
    // 1. GET /api/transactions/:transactionId
    router.get('/transactions/:transactionId', async (req, res) => {
        try {
            const transactionId = Array.isArray(req.params.transactionId) ? req.params.transactionId[0] : req.params.transactionId;
            const tx = await adapter.getTransactionById(transactionId);
            if (!tx) {
                return res.status(404).json({ error: 'Transaction not found', transactionId });
            }
            res.json(tx);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // 2. GET /api/accounts/:accountId
    router.get('/accounts/:accountId', async (req, res) => {
        try {
            const accountId = Array.isArray(req.params.accountId) ? req.params.accountId[0] : req.params.accountId;
            const acc = await adapter.getAccountById(accountId);
            if (!acc) {
                // Fallback to graph node info if simulated
                const node = graph.getNode(accountId);
                if (node) {
                    return res.json({
                        accountId: node.id,
                        accountHolder: node.label,
                        bankName: node.data.bankName || 'Partner Bank',
                        riskScore: node.riskScore,
                        status: 'ACTIVE',
                        amountReceived: node.amountReceived,
                        amountSent: node.amountSent,
                        deviceIds: ['DEV-GENERIC'],
                        upiIds: []
                    });
                }
                return res.status(404).json({ error: 'Account entity not found', accountId: req.params.accountId });
            }
            // Enrich with graph in/out statistics
            const inEdges = graph.getInEdges(acc.accountId);
            const outEdges = graph.getOutEdges(acc.accountId);
            const totalReceived = inEdges.reduce((sum, e) => sum + e.transaction.amount, 0);
            const totalSent = outEdges.reduce((sum, e) => sum + e.transaction.amount, 0);
            const connectedAccounts = Array.from(new Set([
                ...inEdges.map(e => e.source),
                ...outEdges.map(e => e.target)
            ]));
            res.json({
                ...acc,
                incomingTransactionsCount: inEdges.length,
                outgoingTransactionsCount: outEdges.length,
                totalReceived,
                totalSent,
                connectedAccounts,
                connectedAccountsCount: connectedAccounts.length
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // 3. GET /api/money-flow/trace?source=...&direction=...&maxHops=...
    router.get('/money-flow/trace', async (req, res) => {
        try {
            const query = req.query.source || 'TXN-FNX-9001';
            const direction = req.query.direction || 'outgoing';
            const maxHops = parseInt(req.query.maxHops, 10) || 5;
            const result = await traceEngine.traceMoneyFlow({ query, direction, maxHops });
            // Save paths in cache
            result.paths.forEach(p => pathCache.set(p.pathId, p));
            logAudit('TRACE_MONEY_FLOW', query, { direction, maxHops, totalFoundPaths: result.paths.length });
            res.json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // 4. GET /api/money-flow/path/:pathId
    router.get('/money-flow/path/:pathId', (req, res) => {
        const pathId = Array.isArray(req.params.pathId) ? req.params.pathId[0] : req.params.pathId;
        const path = pathCache.get(pathId);
        if (!path) {
            return res.status(404).json({ error: 'Path not found in active session', pathId });
        }
        res.json(path);
    });
    // 5. GET /api/money-flow/:pathId/transactions
    router.get('/money-flow/:pathId/transactions', (req, res) => {
        const pathId = Array.isArray(req.params.pathId) ? req.params.pathId[0] : req.params.pathId;
        const path = pathCache.get(pathId);
        if (!path) {
            return res.status(404).json({ error: 'Path not found', pathId });
        }
        res.json(path.transactions || []);
    });
    // 6. GET /api/money-flow/:pathId/entities
    router.get('/money-flow/:pathId/entities', (req, res) => {
        const pathId = Array.isArray(req.params.pathId) ? req.params.pathId[0] : req.params.pathId;
        const path = pathCache.get(pathId);
        if (!path) {
            return res.status(404).json({ error: 'Path not found', pathId });
        }
        res.json(path.nodes || []);
    });
    // 7. GET /api/money-flow/:pathId/risk
    router.get('/money-flow/:pathId/risk', (req, res) => {
        const pathId = Array.isArray(req.params.pathId) ? req.params.pathId[0] : req.params.pathId;
        const path = pathCache.get(pathId);
        if (!path) {
            return res.status(404).json({ error: 'Path not found', pathId });
        }
        res.json({
            score: path.riskScore,
            level: path.riskLevel,
            breakdown: path.riskBreakdown
        });
    });
    // 8. POST /api/transactions/ingest
    router.post('/transactions/ingest', async (req, res) => {
        try {
            const tx = req.body;
            if (!tx.transactionId || !tx.senderAccountId || !tx.receiverAccountId || !tx.amount) {
                return res.status(400).json({ error: 'Missing required transaction fields' });
            }
            await adapter.ingestTransaction(tx);
            graph.addTransactionToGraph(tx);
            traceEngine.updateGraph(graph);
            logAudit('TRANSACTION_INGESTED', tx.transactionId, { sender: tx.senderAccountId, receiver: tx.receiverAccountId, amount: tx.amount });
            res.status(201).json({ status: 'INGESTED', transactionId: tx.transactionId });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // 9. POST /api/money-flow/recalculate
    router.post('/money-flow/recalculate', async (req, res) => {
        try {
            const { source, direction, maxHops } = req.body;
            const query = source || 'TXN-FNX-9001';
            const result = await traceEngine.traceMoneyFlow({ query, direction, maxHops });
            result.paths.forEach(p => pathCache.set(p.pathId, p));
            logAudit('PATHS_RECALCULATED', query, { pathCount: result.paths.length });
            res.json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // 10. GET /api/data-source/status
    router.get('/data-source/status', (req, res) => {
        const status = adapter.getStatus();
        res.json({
            ...status,
            currentEnvSource: AdapterFactory_1.AdapterFactory.getCurrentSource(),
            supportedSources: ['demo', 'api', 'bank', 'payment', 'csv', 'webhook']
        });
    });
    // 11. POST /api/simulation/trigger (Live incoming transaction simulation)
    router.post('/simulation/trigger', async (req, res) => {
        try {
            const { targetAccountId } = req.body;
            const result = await simulationService.simulateTransaction(targetAccountId);
            logAudit('SIMULATION_TRIGGERED', result.newTransaction.transactionId, { affectedAccount: result.affectedAccount });
            res.json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // 12. GET /api/audit-logs
    router.get('/audit-logs', (req, res) => {
        res.json(auditLogs);
    });
    // 13. GET /api/contract/export/:pathId (Section 28 Integration Contract)
    router.get('/contract/export/:pathId', (req, res) => {
        const pathId = Array.isArray(req.params.pathId) ? req.params.pathId[0] : req.params.pathId;
        const path = pathCache.get(pathId);
        if (!path) {
            return res.status(404).json({ error: 'Path not found', pathId });
        }
        const contract = {
            pathId: path.pathId,
            sourceEntity: path.sourceEntity,
            destinationEntity: path.destinationEntity,
            totalAmount: path.totalAmount,
            transactionCount: path.transactionCount,
            hopCount: path.hopCount,
            durationMinutes: path.durationMinutes,
            riskScore: path.riskScore,
            riskLevel: path.riskLevel,
            relatedClusterId: path.relatedClusterId,
            status: path.status
        };
        logAudit('CONTRACT_EXPORTED', path.pathId, { riskScore: path.riskScore, totalAmount: path.totalAmount });
        res.json(contract);
    });
    // 14. GET /api/quick-scenarios
    router.get('/quick-scenarios', (req, res) => {
        res.json([
            {
                id: 'scenario-primary',
                name: 'Primary Case: ₹2,84,000 Victim Flow',
                target: 'TXN-FNX-9001',
                direction: 'outgoing',
                hops: 5,
                badge: 'Critical Layering',
                description: 'Compromised victim account (Ramesh Sharma) funds routed through multi-hop mule network into offshore liquidity gateway.'
            },
            {
                id: 'scenario-fanout',
                name: 'Split Pattern: 1-to-4 Mule Dispersal',
                target: 'ACC-MULE-401',
                direction: 'outgoing',
                hops: 3,
                badge: 'Fan-Out',
                description: 'Single intermediary account disperses incoming funds rapidly into 4 distinct recipient accounts.'
            },
            {
                id: 'scenario-fanin',
                name: 'Merge Pattern: 4-to-1 Consolidation Vault',
                target: 'ACC-CONS-709',
                direction: 'incoming',
                hops: 3,
                badge: 'Fan-In',
                description: 'Apex pool vault accumulating funds from 4 feeder mule accounts simultaneously.'
            },
            {
                id: 'scenario-circular',
                name: 'Circular Flow: Round-Tripping Ring',
                target: 'ACC-RING-101',
                direction: 'both',
                hops: 4,
                badge: 'Circular Cycle',
                description: 'Closed-loop 3-entity ring transferring money in circles to artificially inflate transaction volume.'
            }
        ]);
    });
    return router;
}
