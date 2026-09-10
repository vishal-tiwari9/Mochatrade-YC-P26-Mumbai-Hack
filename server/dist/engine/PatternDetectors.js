"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternDetectors = void 0;
class PatternDetectors {
    /**
     * Detects Fan-Out (Split transfers) from a node where 1 account disperses to multiple accounts.
     */
    static detectFanOut(nodeId, graph) {
        const patterns = [];
        const outEdges = graph.getOutEdges(nodeId);
        if (outEdges.length < 2)
            return patterns;
        // Group outgoing transactions by temporal clustering (within 60 mins)
        const sortedEdges = [...outEdges].sort((a, b) => new Date(a.transaction.timestamp).getTime() - new Date(b.transaction.timestamp).getTime());
        const distinctTargets = new Set();
        let totalOutgoing = 0;
        const timestamps = [];
        sortedEdges.forEach(e => {
            distinctTargets.add(e.target);
            totalOutgoing += e.transaction.amount;
            timestamps.push(new Date(e.transaction.timestamp).getTime());
        });
        if (distinctTargets.size >= 2) {
            const minTime = Math.min(...timestamps);
            const maxTime = Math.max(...timestamps);
            const windowMinutes = Math.max(1, Math.round((maxTime - minTime) / 60000));
            const sourceNode = graph.getNode(nodeId);
            patterns.push({
                sourceAccountId: nodeId,
                sourceLabel: sourceNode ? sourceNode.label : nodeId,
                destinationsCount: distinctTargets.size,
                destinations: Array.from(distinctTargets),
                totalOutgoing,
                timeWindowMinutes: windowMinutes,
                description: `Potential Fan-Out Pattern: Account dispersed ₹${totalOutgoing.toLocaleString('en-IN')} across ${distinctTargets.size} distinct recipient accounts within ${windowMinutes} minutes.`
            });
        }
        return patterns;
    }
    /**
     * Detects Fan-In (Consolidation) where multiple accounts send funds into a single accumulator.
     */
    static detectFanIn(nodeId, graph) {
        const patterns = [];
        const inEdges = graph.getInEdges(nodeId);
        if (inEdges.length < 2)
            return patterns;
        const distinctSources = new Set();
        let totalIncoming = 0;
        const timestamps = [];
        inEdges.forEach(e => {
            distinctSources.add(e.source);
            totalIncoming += e.transaction.amount;
            timestamps.push(new Date(e.transaction.timestamp).getTime());
        });
        if (distinctSources.size >= 2) {
            const minTime = Math.min(...timestamps);
            const maxTime = Math.max(...timestamps);
            const windowMinutes = Math.max(1, Math.round((maxTime - minTime) / 60000));
            const targetNode = graph.getNode(nodeId);
            patterns.push({
                targetAccountId: nodeId,
                targetLabel: targetNode ? targetNode.label : nodeId,
                sourcesCount: distinctSources.size,
                sources: Array.from(distinctSources),
                totalIncoming,
                timeWindowMinutes: windowMinutes,
                description: `Potential Fund Consolidation Pattern: Received ₹${totalIncoming.toLocaleString('en-IN')} from ${distinctSources.size} distinct feeder accounts within ${windowMinutes} minutes. Requires Investigation.`
            });
        }
        return patterns;
    }
    /**
     * Detects Circular Flow (Cycles like A -> B -> C -> A) using Depth First Search.
     */
    static detectCircularFlow(startNodeId, graph, maxDepth = 6) {
        const patterns = [];
        const visited = new Set();
        const currentPath = [];
        function dfs(currentId, depth) {
            if (depth > maxDepth)
                return;
            const outEdges = graph.getOutEdges(currentId);
            for (const edge of outEdges) {
                if (edge.target === startNodeId && currentPath.length >= 2) {
                    // Found cycle back to startNodeId
                    const cycleAccounts = [...currentPath.map(p => p.nodeId), startNodeId];
                    const txs = [...currentPath.map(p => p.tx), edge.transaction];
                    const totalAmount = txs.reduce((sum, t) => sum + t.amount, 0);
                    const times = txs.map(t => new Date(t.timestamp).getTime());
                    const timeSpanMinutes = Math.max(1, Math.round((Math.max(...times) - Math.min(...times)) / 60000));
                    patterns.push({
                        cycleLength: cycleAccounts.length - 1,
                        cycleAccounts,
                        totalCycleAmount: totalAmount,
                        timeSpanMinutes,
                        transactionIds: txs.map(t => t.transactionId),
                        description: `Potential Circular Money Flow: ${cycleAccounts.length - 1}-node cycle detected round-tripping ₹${totalAmount.toLocaleString('en-IN')} in ${timeSpanMinutes} minutes.`
                    });
                    return;
                }
                if (!visited.has(edge.target)) {
                    visited.add(edge.target);
                    currentPath.push({ nodeId: edge.target, tx: edge.transaction });
                    dfs(edge.target, depth + 1);
                    currentPath.pop();
                    visited.delete(edge.target);
                }
            }
        }
        dfs(startNodeId, 1);
        return patterns;
    }
    /**
     * Calculates fund retention at each stage along a money flow path.
     * Tracks: Amount Received, Amount Sent, Amount Retained, Percentage Passed Forward.
     */
    static calculateFundRetention(nodes, transactions) {
        const stages = [];
        // Map incoming and outgoing amounts specifically within this traced path sequence
        const nodeInAmount = new Map();
        const nodeOutAmount = new Map();
        transactions.forEach(tx => {
            nodeOutAmount.set(tx.senderAccountId, (nodeOutAmount.get(tx.senderAccountId) || 0) + tx.amount);
            nodeInAmount.set(tx.receiverAccountId, (nodeInAmount.get(tx.receiverAccountId) || 0) + tx.amount);
        });
        nodes.forEach((node, idx) => {
            const isSource = idx === 0;
            const isFinal = idx === nodes.length - 1;
            const received = isSource
                ? (nodeOutAmount.get(node.id) || 0)
                : (nodeInAmount.get(node.id) || 0);
            const sent = isFinal
                ? 0
                : (nodeOutAmount.get(node.id) || 0);
            const retained = Math.max(0, received - sent);
            const retentionRatePercent = received > 0
                ? Math.round(((received - sent) / received) * 100)
                : 0;
            stages.push({
                nodeId: node.id,
                label: node.label,
                role: node.role,
                roleLabel: node.roleLabel,
                received,
                sent,
                retained,
                retentionRatePercent
            });
        });
        return stages;
    }
    /**
     * Calculates velocity and time difference between hops in minutes.
     */
    static calculateTimeIntervals(transactions) {
        if (transactions.length === 0) {
            return { intervals: [], totalDurationMinutes: 0 };
        }
        const sorted = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const intervals = [];
        for (let i = 1; i < sorted.length; i++) {
            const diffMs = new Date(sorted[i].timestamp).getTime() - new Date(sorted[i - 1].timestamp).getTime();
            const diffMins = Math.max(0, Math.round(diffMs / 60000));
            intervals.push(diffMins);
        }
        const firstTime = new Date(sorted[0].timestamp).getTime();
        const lastTime = new Date(sorted[sorted.length - 1].timestamp).getTime();
        const totalDurationMinutes = Math.max(1, Math.round((lastTime - firstTime) / 60000));
        return { intervals, totalDurationMinutes };
    }
}
exports.PatternDetectors = PatternDetectors;
