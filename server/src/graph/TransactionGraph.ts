import { Transaction, Account, UPIEntity, Beneficiary, FraudIncident, PathNode, PathEdge } from '../models/types';

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  transaction: Transaction;
}

export class TransactionGraph {
  private nodes: Map<string, PathNode> = new Map();
  private outEdges: Map<string, GraphEdge[]> = new Map();
  private inEdges: Map<string, GraphEdge[]> = new Map();
  private transactionsMap: Map<string, Transaction> = new Map();

  constructor(
    accounts: Account[],
    transactions: Transaction[],
    upiEntities: UPIEntity[],
    beneficiaries: Beneficiary[],
    fraudIncidents: FraudIncident[]
  ) {
    this.buildGraph(accounts, transactions, upiEntities, beneficiaries, fraudIncidents);
  }

  private buildGraph(
    accounts: Account[],
    transactions: Transaction[],
    upiEntities: UPIEntity[],
    beneficiaries: Beneficiary[],
    fraudIncidents: FraudIncident[]
  ): void {
    // 1. Add Account Nodes
    accounts.forEach(acc => {
      this.nodes.set(acc.accountId, {
        id: acc.accountId,
        label: `${acc.accountId} (${acc.accountHolder})`,
        entityType: 'ACCOUNT',
        role: 'intermediate',
        roleLabel: 'Potential Intermediary',
        riskScore: acc.riskScore,
        amountReceived: 0,
        amountSent: 0,
        amountRetained: 0,
        retentionRatePercent: 0,
        data: {
          ...acc,
          bankName: acc.bankName
        }
      });
      this.outEdges.set(acc.accountId, []);
      this.inEdges.set(acc.accountId, []);
    });

    // 2. Add Beneficiaries if not already an account
    beneficiaries.forEach(ben => {
      if (!this.nodes.has(ben.beneficiaryId)) {
        this.nodes.set(ben.beneficiaryId, {
          id: ben.beneficiaryId,
          label: `${ben.beneficiaryId} (${ben.name})`,
          entityType: 'BENEFICIARY',
          role: 'destination',
          roleLabel: 'Potential Fraud Destination',
          riskScore: ben.riskLevel === 'CRITICAL' ? 95 : ben.riskLevel === 'HIGH' ? 80 : 50,
          amountReceived: 0,
          amountSent: 0,
          amountRetained: 0,
          retentionRatePercent: 0,
          data: {
            accountHolder: ben.name,
            bankName: ben.bankName,
            status: 'ACTIVE'
          } as any
        });
        this.outEdges.set(ben.beneficiaryId, []);
        this.inEdges.set(ben.beneficiaryId, []);
      }
    });

    // 3. Add Edges from Transactions
    transactions.forEach(tx => {
      this.addTransactionToGraph(tx);
    });
  }

  public addTransactionToGraph(tx: Transaction): void {
    this.transactionsMap.set(tx.transactionId, tx);

    // Ensure source node exists
    if (!this.nodes.has(tx.senderAccountId)) {
      this.nodes.set(tx.senderAccountId, {
        id: tx.senderAccountId,
        label: `Account ${tx.senderAccountId}`,
        entityType: 'ACCOUNT',
        role: 'intermediate',
        roleLabel: 'Potential Intermediary',
        riskScore: tx.riskScore || 50,
        amountReceived: 0,
        amountSent: 0,
        amountRetained: 0,
        retentionRatePercent: 0,
        data: { accountHolder: tx.senderAccountId } as any
      });
      this.outEdges.set(tx.senderAccountId, []);
      this.inEdges.set(tx.senderAccountId, []);
    }

    // Ensure target node exists
    if (!this.nodes.has(tx.receiverAccountId)) {
      this.nodes.set(tx.receiverAccountId, {
        id: tx.receiverAccountId,
        label: `Account ${tx.receiverAccountId}`,
        entityType: 'ACCOUNT',
        role: 'intermediate',
        roleLabel: 'Potential Intermediary',
        riskScore: tx.riskScore || 50,
        amountReceived: 0,
        amountSent: 0,
        amountRetained: 0,
        retentionRatePercent: 0,
        data: { accountHolder: tx.receiverAccountId } as any
      });
      this.outEdges.set(tx.receiverAccountId, []);
      this.inEdges.set(tx.receiverAccountId, []);
    }

    const edge: GraphEdge = {
      id: `edge-${tx.transactionId}`,
      source: tx.senderAccountId,
      target: tx.receiverAccountId,
      transaction: tx
    };

    const outList = this.outEdges.get(tx.senderAccountId) || [];
    outList.push(edge);
    this.outEdges.set(tx.senderAccountId, outList);

    const inList = this.inEdges.get(tx.receiverAccountId) || [];
    inList.push(edge);
    this.inEdges.set(tx.receiverAccountId, inList);

    // Update node aggregated flow amounts
    const senderNode = this.nodes.get(tx.senderAccountId)!;
    senderNode.amountSent += tx.amount;
    senderNode.amountRetained = Math.max(0, senderNode.amountReceived - senderNode.amountSent);

    const receiverNode = this.nodes.get(tx.receiverAccountId)!;
    receiverNode.amountReceived += tx.amount;
    receiverNode.amountRetained = Math.max(0, receiverNode.amountReceived - receiverNode.amountSent);
  }

  public getNode(id: string): PathNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): PathNode[] {
    return Array.from(this.nodes.values());
  }

  public getOutEdges(nodeId: string): GraphEdge[] {
    return this.outEdges.get(nodeId) || [];
  }

  public getInEdges(nodeId: string): GraphEdge[] {
    return this.inEdges.get(nodeId) || [];
  }

  public getTransaction(txId: string): Transaction | undefined {
    return this.transactionsMap.get(txId);
  }

  public getAllTransactions(): Transaction[] {
    return Array.from(this.transactionsMap.values());
  }
}
