import { TraceQueryResult, Account, Transaction, QuickScenario, AuditLog, FraudNexusIntegrationContract, MoneyFlowPath } from '../types';

const API_BASE = '/api';

export const api = {
  async traceMoneyFlow(query: string, direction: 'outgoing' | 'incoming' | 'both' = 'outgoing', maxHops: number = 5): Promise<TraceQueryResult> {
    const params = new URLSearchParams({
      source: query,
      direction,
      maxHops: maxHops.toString()
    });
    const res = await fetch(`${API_BASE}/money-flow/trace?${params}`);
    if (!res.ok) {
      throw new Error(`Trace failed: ${res.statusText}`);
    }
    return res.json();
  },

  async getTransaction(id: string): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Transaction not found');
    return res.json();
  },

  async getAccount(id: string): Promise<Account> {
    const res = await fetch(`${API_BASE}/accounts/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Account not found');
    return res.json();
  },

  async getPath(pathId: string): Promise<MoneyFlowPath> {
    const res = await fetch(`${API_BASE}/money-flow/path/${encodeURIComponent(pathId)}`);
    if (!res.ok) throw new Error('Path not found');
    return res.json();
  },

  async getQuickScenarios(): Promise<QuickScenario[]> {
    const res = await fetch(`${API_BASE}/quick-scenarios`);
    if (!res.ok) return [];
    return res.json();
  },

  async getDataSourceStatus(): Promise<{
    adapterName: string;
    status: string;
    totalTransactions: number;
    totalAccounts: number;
    totalUpiEntities: number;
    lastUpdated: string;
    currentEnvSource: string;
    supportedSources: string[];
  }> {
    const res = await fetch(`${API_BASE}/data-source/status`);
    if (!res.ok) throw new Error('Failed to fetch data source status');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    if (!res.ok) return [];
    return res.json();
  },

  async getContract(pathId: string): Promise<FraudNexusIntegrationContract> {
    const res = await fetch(`${API_BASE}/contract/export/${encodeURIComponent(pathId)}`);
    if (!res.ok) throw new Error('Failed to generate contract');
    return res.json();
  },

  async simulateIncomingTransaction(targetAccountId?: string): Promise<{
    newTransaction: Transaction;
    affectedAccount: string;
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/simulation/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetAccountId })
    });
    if (!res.ok) throw new Error('Simulation failed');
    return res.json();
  }
};
