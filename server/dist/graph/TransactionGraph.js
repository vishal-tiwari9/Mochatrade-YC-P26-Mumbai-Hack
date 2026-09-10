"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionGraph = void 0;
class TransactionGraph {
    nodes = new Map();
    outEdges = new Map();
    inEdges = new Map();
    transactionsMap = new Map();
    constructor(accounts, transactions, upiEntities, beneficiaries, fraudIncidents) {
        this.buildGraph(accounts, transactions, upiEntities, beneficiaries, fraudIncidents);
    }
    buildGraph(accounts, transactions, upiEntities, beneficiaries, fraudIncidents) {
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
                    }
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
    addTransactionToGraph(tx) {
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
                data: { accountHolder: tx.senderAccountId }
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
                data: { accountHolder: tx.receiverAccountId }
            });
            this.outEdges.set(tx.receiverAccountId, []);
            this.inEdges.set(tx.receiverAccountId, []);
        }
        const edge = {
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
        const senderNode = this.nodes.get(tx.senderAccountId);
        senderNode.amountSent += tx.amount;
        senderNode.amountRetained = Math.max(0, senderNode.amountReceived - senderNode.amountSent);
        const receiverNode = this.nodes.get(tx.receiverAccountId);
        receiverNode.amountReceived += tx.amount;
        receiverNode.amountRetained = Math.max(0, receiverNode.amountReceived - receiverNode.amountSent);
    }
    getNode(id) {
        return this.nodes.get(id);
    }
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    getOutEdges(nodeId) {
        return this.outEdges.get(nodeId) || [];
    }
    getInEdges(nodeId) {
        return this.inEdges.get(nodeId) || [];
    }
    getTransaction(txId) {
        return this.transactionsMap.get(txId);
    }
    getAllTransactions() {
        return Array.from(this.transactionsMap.values());
    }
}
exports.TransactionGraph = TransactionGraph;
