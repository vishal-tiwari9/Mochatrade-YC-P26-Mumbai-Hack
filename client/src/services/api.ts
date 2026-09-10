import { 
  FraudCluster, 
  TopKpis, 
  ClusterNetworkGraph, 
  ClusterGrowthPoint, 
  IntegrationContract, 
  DataSourceStatus, 
  AuditLogEntry,
  NormalizedTransaction
} from '../types/index.js';

const API_BASE = '/api';

export async function fetchClusters(params?: {
  riskLevel?: string;
  minScore?: number;
  status?: string;
  search?: string;
}): Promise<{ kpis: TopKpis; clusters: FraudCluster[] }> {
  const query = new URLSearchParams();
  if (params?.riskLevel && params.riskLevel !== 'ALL') query.append('riskLevel', params.riskLevel);
  if (params?.minScore !== undefined && params.minScore > 0) query.append('minScore', String(params.minScore));
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/fraud-clusters?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch clusters: ${res.statusText}`);
  const json = await res.json();
  return json.data;
}

export async function fetchClusterDetail(clusterId: string): Promise<FraudCluster> {
  const res = await fetch(`${API_BASE}/fraud-clusters/${encodeURIComponent(clusterId)}`);
  if (!res.ok) throw new Error(`Failed to fetch cluster ${clusterId}`);
  const json = await res.json();
  return json.data;
}

export async function fetchClusterNetwork(clusterId: string): Promise<ClusterNetworkGraph> {
  const res = await fetch(`${API_BASE}/fraud-clusters/${encodeURIComponent(clusterId)}/network`);
  if (!res.ok) throw new Error(`Failed to fetch network graph for ${clusterId}`);
  const json = await res.json();
  return json.data;
}

export async function fetchClusterTransactions(clusterId: string): Promise<NormalizedTransaction[]> {
  const res = await fetch(`${API_BASE}/fraud-clusters/${encodeURIComponent(clusterId)}/transactions`);
  if (!res.ok) throw new Error(`Failed to fetch transactions for ${clusterId}`);
  const json = await res.json();
  return json.data;
}

export async function fetchClusterGrowth(clusterId: string): Promise<ClusterGrowthPoint[]> {
  const res = await fetch(`${API_BASE}/fraud-clusters/${encodeURIComponent(clusterId)}/growth`);
  if (!res.ok) throw new Error(`Failed to fetch growth series for ${clusterId}`);
  const json = await res.json();
  return json.data;
}

export async function fetchIntegrationContract(clusterId: string): Promise<IntegrationContract> {
  const res = await fetch(`${API_BASE}/fraud-clusters/${encodeURIComponent(clusterId)}/contract`);
  if (!res.ok) throw new Error(`Failed to fetch integration contract for ${clusterId}`);
  const json = await res.json();
  return json.data;
}

export async function findShortestPath(clusterId: string, startId: string, endId: string): Promise<{ path: string[]; edges: string[] } | null> {
  const res = await fetch(`${API_BASE}/fraud-clusters/${encodeURIComponent(clusterId)}/shortest-path?startId=${encodeURIComponent(startId)}&endId=${encodeURIComponent(endId)}`);
  if (!res.ok) throw new Error('Failed to query shortest path');
  const json = await res.json();
  return json.data;
}

export async function ingestTransaction(txn: Partial<NormalizedTransaction>): Promise<any> {
  const res = await fetch(`${API_BASE}/transactions/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txn)
  });
  if (!res.ok) throw new Error('Failed to ingest transaction');
  return res.json();
}

export async function reloadDataset(): Promise<void> {
  const res = await fetch(`${API_BASE}/data/reload`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reload dataset');
}

export async function fetchDataSourceStatus(): Promise<DataSourceStatus> {
  const res = await fetch(`${API_BASE}/data-source/status`);
  if (!res.ok) throw new Error('Failed to fetch data source status');
  const json = await res.json();
  return json.data;
}

export async function fetchAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_BASE}/system/audit/logs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  const json = await res.json();
  return json.data;
}

export async function logAuditAction(action: string, clusterId?: string, details: Record<string, any> = {}): Promise<void> {
  try {
    await fetch(`${API_BASE}/system/audit/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, clusterId, details })
    });
  } catch (err) {
    console.error('Failed to send audit log', err);
  }
}
