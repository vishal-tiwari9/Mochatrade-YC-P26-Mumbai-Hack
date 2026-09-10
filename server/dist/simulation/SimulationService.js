"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationService = void 0;
class SimulationService {
    adapter;
    graph;
    traceEngine;
    simCounter = 1;
    constructor(adapter, graph, traceEngine) {
        this.adapter = adapter;
        this.graph = graph;
        this.traceEngine = traceEngine;
    }
    async simulateTransaction(targetAccountId) {
        const simId = `TXN-SIM-${Date.now().toString().slice(-6)}`;
        const sender = targetAccountId || 'ACC121';
        const newMuleId = `ACC-SIM-MULE-${this.simCounter++}`;
        const amount = 35000 + Math.floor(Math.random() * 85000);
        const newTx = {
            transactionId: simId,
            timestamp: new Date().toISOString(),
            senderAccountId: sender,
            receiverAccountId: newMuleId,
            senderUpiId: `${sender.toLowerCase()}@paytm`,
            receiverUpiId: `mule${newMuleId.toLowerCase()}@okhdfcbank`,
            amount,
            currency: 'INR',
            channel: 'UPI',
            deviceId: `DEV-SIM-${this.simCounter}`,
            status: 'FLAGGED',
            narrative: 'LIVE SIMULATED INCOMING TRANSFER DETECTED IN STREAM',
            riskScore: 92
        };
        // 1. Ingest into data adapter
        await this.adapter.ingestTransaction(newTx);
        // 2. Add to transaction graph
        this.graph.addTransactionToGraph(newTx);
        // 3. Update trace engine
        this.traceEngine.updateGraph(this.graph);
        return {
            newTransaction: newTx,
            affectedAccount: sender,
            message: `Simulated transaction ${simId} of ₹${amount.toLocaleString('en-IN')} ingested into graph from ${sender} to ${newMuleId}. Dynamic graph topology updated.`
        };
    }
}
exports.SimulationService = SimulationService;
