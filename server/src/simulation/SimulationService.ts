import { IDataAdapter } from '../adapters/IDataAdapter';
import { TransactionGraph } from '../graph/TransactionGraph';
import { TraceEngine } from '../engine/TraceEngine';
import { Transaction } from '../models/types';

export class SimulationService {
  private adapter: IDataAdapter;
  private graph: TransactionGraph;
  private traceEngine: TraceEngine;
  private simCounter = 1;

  constructor(adapter: IDataAdapter, graph: TransactionGraph, traceEngine: TraceEngine) {
    this.adapter = adapter;
    this.graph = graph;
    this.traceEngine = traceEngine;
  }

  public async simulateTransaction(targetAccountId?: string): Promise<{
    newTransaction: Transaction;
    affectedAccount: string;
    message: string;
  }> {
    const simId = `TXN-SIM-${Date.now().toString().slice(-6)}`;
    const sender = targetAccountId || 'ACC121';
    const newMuleId = `ACC-SIM-MULE-${this.simCounter++}`;
    const amount = 35000 + Math.floor(Math.random() * 85000);

    const newTx: Transaction = {
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
