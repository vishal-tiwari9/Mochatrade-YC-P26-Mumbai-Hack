import { TransactionGraph } from '../graph/TransactionGraph';
import { IDataAdapter } from '../adapters/IDataAdapter';
import { Transaction, PathNode, PathEdge, MoneyFlowPath, TraceQueryResult, FraudIncident } from '../models/types';
import { AttackPathClassifier } from './AttackPathClassifier';
import { PatternDetectors } from './PatternDetectors';
import { RiskEngine } from './RiskEngine';

export class TraceEngine {
  private graph: TransactionGraph;
  private adapter: IDataAdapter;

  constructor(graph: TransactionGraph, adapter: IDataAdapter) {
    this.graph = graph;
    this.adapter = adapter;
  }

  public updateGraph(graph: TransactionGraph): void {
    this.graph = graph;
  }

  /**
   * Main trace endpoint handler.
   * Resolves search query (Transaction ID, Account ID, UPI ID, Fraud Incident ID).
   */
  public async traceMoneyFlow(params: {
    query: string;
    direction?: 'outgoing' | 'incoming' | 'both';
    maxHops?: number;
  }): Promise<TraceQueryResult> {
    const direction = params.direction || 'outgoing';
    const maxHops = Math.min(10, Math.max(1, Number(params.maxHops) || 5));
    const rawQuery = params.query.trim();

    // 1. Resolve Query Target
    let startAccountId = rawQuery;
    let initialTransaction: Transaction | null = null;
    let relatedIncident: FraudIncident | null = null;

    // Check if query is a Transaction ID
    const tx = await this.adapter.getTransactionById(rawQuery);
    if (tx) {
      initialTransaction = tx;
      startAccountId = direction === 'incoming' ? tx.receiverAccountId : tx.senderAccountId;
    } else {
      // Check if query is a UPI ID
      const upi = await this.adapter.getUpiEntityById(rawQuery);
      if (upi) {
        startAccountId = upi.associatedAccountId;
      } else {
        // Check if query is a Fraud Incident ID
        const incident = await this.adapter.getFraudIncidentById(rawQuery);
        if (incident) {
          relatedIncident = incident;
          startAccountId = incident.associatedAccounts[0] || rawQuery;
        }
      }
    }

    // Check incidents related to startAccountId if not already matched
    if (!relatedIncident) {
      const incidents = await this.adapter.getFraudIncidents();
      relatedIncident = incidents.find(inc => 
        inc.associatedAccounts.includes(startAccountId) || 
        inc.associatedAccounts.includes(rawQuery)
      ) || null;
    }

    // 2. Discover Connected Paths using Directed BFS/DFS
    const paths = this.discoverPaths({
      startNodeId: startAccountId,
      direction,
      maxHops,
      seedTx: initialTransaction,
      relatedIncident
    });

    const activePath = paths.length > 0 ? paths[0] : this.createFallbackEmptyPath(startAccountId);

    return {
      source: `ACCOUNT:${startAccountId}`,
      direction,
      maxHops,
      totalAmount: activePath.totalAmount,
      hopCount: activePath.hopCount,
      pathRiskScore: activePath.riskScore,
      riskLevel: activePath.riskLevel,
      nodes: activePath.nodes,
      transactions: activePath.transactions,
      paths,
      activePath
    };
  }

  private discoverPaths(opts: {
    startNodeId: string;
    direction: 'outgoing' | 'incoming' | 'both';
    maxHops: number;
    seedTx: Transaction | null;
    relatedIncident: FraudIncident | null;
  }): MoneyFlowPath[] {
    const { startNodeId, direction, maxHops, seedTx, relatedIncident } = opts;
    const discoveredPaths: { nodes: string[]; txs: Transaction[] }[] = [];

    // Tracing Outgoing Paths (Forward in time)
    if (direction === 'outgoing' || direction === 'both') {
      this.findForwardPaths(startNodeId, maxHops, seedTx, (pathNodes, pathTxs) => {
        discoveredPaths.push({ nodes: pathNodes, txs: pathTxs });
      });
    }

    // Tracing Incoming Paths (Backward in time)
    if (direction === 'incoming' || direction === 'both') {
      this.findBackwardPaths(startNodeId, maxHops, seedTx, (pathNodes, pathTxs) => {
        // If bidirectional, avoid duplicate exact single-node paths
        if (!discoveredPaths.some(p => p.nodes.join('->') === pathNodes.join('->'))) {
          discoveredPaths.push({ nodes: pathNodes, txs: pathTxs });
        }
      });
    }

    // Convert discovered raw paths to rich MoneyFlowPath objects
    const resultPaths: MoneyFlowPath[] = discoveredPaths.map((p, idx) => {
      return this.buildMoneyFlowPathObject({
        pathId: `PATH-FNX-${String(idx + 1).padStart(3, '0')}`,
        nodeIds: p.nodes,
        transactions: p.txs,
        relatedIncident
      });
    });

    // Sort paths by risk score descending and hop count descending
    resultPaths.sort((a, b) => b.riskScore - a.riskScore || b.hopCount - a.hopCount);

    return resultPaths;
  }

  private findForwardPaths(
    startNodeId: string,
    maxHops: number,
    seedTx: Transaction | null,
    onPathFound: (nodes: string[], txs: Transaction[]) => void
  ): void {
    const queue: {
      currentId: string;
      visited: Set<string>;
      pathNodes: string[];
      pathTxs: Transaction[];
      lastTimestamp: number;
    }[] = [];

    let initialTime = 0;
    const initialTxs: Transaction[] = [];
    if (seedTx && seedTx.senderAccountId === startNodeId) {
      initialTxs.push(seedTx);
      initialTime = new Date(seedTx.timestamp).getTime();
    }

    queue.push({
      currentId: startNodeId,
      visited: new Set([startNodeId]),
      pathNodes: [startNodeId],
      pathTxs: initialTxs,
      lastTimestamp: initialTime
    });

    let pathsRecorded = 0;

    while (queue.length > 0 && pathsRecorded < 10) {
      const current = queue.shift()!;

      // Get outgoing edges
      const outEdges = this.graph.getOutEdges(current.currentId);
      
      // Filter edges that chronologically match or follow the sequence
      let candidateEdges = outEdges.filter(e => {
        if (current.lastTimestamp === 0) return true;
        const txTime = new Date(e.transaction.timestamp).getTime();
        // Allow transactions within the fraud operational window (+/- 2 hours or after)
        return txTime >= current.lastTimestamp - (60000 * 5);
      });

      // Prefer higher amount transactions or flagged transactions
      candidateEdges.sort((a, b) => b.transaction.amount - a.transaction.amount);

      let extended = false;

      if (current.pathNodes.length <= maxHops) {
        for (const edge of candidateEdges.slice(0, 3)) { // branch up to top 3 paths
          if (!current.visited.has(edge.target)) {
            const nextVisited = new Set(current.visited);
            nextVisited.add(edge.target);

            queue.push({
              currentId: edge.target,
              visited: nextVisited,
              pathNodes: [...current.pathNodes, edge.target],
              pathTxs: [...current.pathTxs, edge.transaction],
              lastTimestamp: new Date(edge.transaction.timestamp).getTime()
            });
            extended = true;
          }
        }
      }

      // If cannot extend further and we have at least 1 hop, record path
      if (!extended && current.pathTxs.length > 0) {
        onPathFound(current.pathNodes, current.pathTxs);
        pathsRecorded++;
      }
    }
  }

  private findBackwardPaths(
    startNodeId: string,
    maxHops: number,
    seedTx: Transaction | null,
    onPathFound: (nodes: string[], txs: Transaction[]) => void
  ): void {
    const inEdges = this.graph.getInEdges(startNodeId);
    if (inEdges.length === 0) return;

    for (const edge of inEdges.slice(0, 3)) {
      onPathFound([edge.source, startNodeId], [edge.transaction]);
    }
  }

  private buildMoneyFlowPathObject(opts: {
    pathId: string;
    nodeIds: string[];
    transactions: Transaction[];
    relatedIncident: FraudIncident | null;
  }): MoneyFlowPath {
    const { pathId, nodeIds, transactions, relatedIncident } = opts;

    // Deduplicate transactions by id
    const uniqueTxMap = new Map<string, Transaction>();
    transactions.forEach(t => uniqueTxMap.set(t.transactionId, t));
    const pathTransactions = Array.from(uniqueTxMap.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Build Path Nodes
    const rawNodes: PathNode[] = nodeIds.map(id => {
      const existing = this.graph.getNode(id);
      if (existing) return existing;
      return {
        id,
        label: `Account ${id}`,
        entityType: 'ACCOUNT',
        role: 'intermediate',
        roleLabel: 'Potential Intermediary',
        riskScore: 50,
        amountReceived: 0,
        amountSent: 0,
        amountRetained: 0,
        retentionRatePercent: 0,
        data: { accountHolder: id } as any
      };
    });

    // Check if consolidation destination
    const lastNodeId = nodeIds[nodeIds.length - 1];
    const inEdgesToLast = this.graph.getInEdges(lastNodeId);
    const isConsolidation = inEdgesToLast.length >= 3;

    // Classify Attack Path Roles
    const classifiedNodes = AttackPathClassifier.classifyPathNodes(
      rawNodes,
      !!relatedIncident,
      isConsolidation
    );

    // Build Path Edges
    const pathEdges: PathEdge[] = [];
    for (let i = 0; i < pathTransactions.length; i++) {
      const tx = pathTransactions[i];
      let diffMinutes = 0;
      if (i > 0) {
        const prevTime = new Date(pathTransactions[i - 1].timestamp).getTime();
        const currTime = new Date(tx.timestamp).getTime();
        diffMinutes = Math.max(0, Math.round((currTime - prevTime) / 60000));
      }

      pathEdges.push({
        id: `edge-${tx.transactionId}`,
        source: tx.senderAccountId,
        target: tx.receiverAccountId,
        transactionId: tx.transactionId,
        amount: tx.amount,
        timestamp: tx.timestamp,
        channel: tx.channel,
        status: tx.status,
        timeDiffMinutes: diffMinutes,
        isSuspicious: tx.riskScore ? tx.riskScore > 75 : false
      });
    }

    // Pattern Detections
    const fanOutPatterns = PatternDetectors.detectFanOut(nodeIds[0], this.graph);
    const fanInPatterns = PatternDetectors.detectFanIn(lastNodeId, this.graph);
    const circularFlows = PatternDetectors.detectCircularFlow(nodeIds[0], this.graph);

    // Fund Retention Waterfall
    const retentionAnalysis = PatternDetectors.calculateFundRetention(classifiedNodes, pathTransactions);

    // Velocity & Time Interval Propagation
    const { totalDurationMinutes } = PatternDetectors.calculateTimeIntervals(pathTransactions);

    // Calculate Dynamic Risk
    const riskAnalysis = RiskEngine.calculatePathRisk({
      nodes: classifiedNodes,
      edges: pathEdges,
      transactions: pathTransactions,
      hasFraudIncident: !!relatedIncident,
      fanOutCount: fanOutPatterns.length,
      fanInCount: fanInPatterns.length,
      hasCircularFlow: circularFlows.length > 0,
      totalPropagationMinutes: totalDurationMinutes
    });

    const sourceNode = classifiedNodes[0];
    const destinationNode = classifiedNodes[classifiedNodes.length - 1];
    const totalAmount = pathTransactions.length > 0 ? pathTransactions[0].amount : 0;

    return {
      pathId,
      sourceEntity: sourceNode ? sourceNode.id : nodeIds[0],
      destinationEntity: destinationNode ? destinationNode.id : lastNodeId,
      sourceLabel: sourceNode ? sourceNode.label : nodeIds[0],
      destinationLabel: destinationNode ? destinationNode.label : lastNodeId,
      totalAmount,
      transactionCount: pathTransactions.length,
      hopCount: Math.max(1, classifiedNodes.length - 1),
      durationMinutes: totalDurationMinutes,
      riskScore: riskAnalysis.score,
      riskLevel: riskAnalysis.level,
      relatedClusterId: relatedIncident?.incidentId || 'FNX-CL-2841',
      status: riskAnalysis.score >= 80 ? 'REQUIRES_INVESTIGATION' : 'VERIFIED_SUSPICIOUS',
      nodes: classifiedNodes,
      edges: pathEdges,
      transactions: pathTransactions,
      retentionAnalysis,
      fanOutPatterns,
      fanInPatterns,
      circularFlows,
      riskBreakdown: riskAnalysis.breakdown
    };
  }

  private createFallbackEmptyPath(nodeId: string): MoneyFlowPath {
    const node = this.graph.getNode(nodeId) || {
      id: nodeId,
      label: `Account ${nodeId}`,
      entityType: 'ACCOUNT',
      role: 'source',
      roleLabel: 'Originating Account',
      riskScore: 30,
      amountReceived: 0,
      amountSent: 0,
      amountRetained: 0,
      retentionRatePercent: 0,
      data: {}
    };

    return {
      pathId: 'PATH-FNX-INIT',
      sourceEntity: nodeId,
      destinationEntity: nodeId,
      sourceLabel: node.label,
      destinationLabel: node.label,
      totalAmount: 0,
      transactionCount: 0,
      hopCount: 0,
      durationMinutes: 0,
      riskScore: 20,
      riskLevel: 'LOW',
      relatedClusterId: 'FNX-CL-NONE',
      status: 'REQUIRES_INVESTIGATION',
      nodes: [node],
      edges: [],
      transactions: [],
      retentionAnalysis: [],
      fanOutPatterns: [],
      fanInPatterns: [],
      circularFlows: [],
      riskBreakdown: [{
        factor: 'Baseline Standalone Entity',
        points: 20,
        rationale: 'No downstream propagated transaction edges discovered from this node.'
      }]
    };
  }
}
