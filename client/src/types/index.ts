export type EntityType = 
  | 'ACCOUNT' 
  | 'UPI' 
  | 'PHONE' 
  | 'DEVICE' 
  | 'TRANSACTION' 
  | 'MERCHANT' 
  | 'BENEFICIARY' 
  | 'IP' 
  | 'LOCATION' 
  | 'FRAUD_INCIDENT';

export type RelationshipType = 
  | 'OWNS' 
  | 'USES' 
  | 'SENT_TO' 
  | 'RECEIVED_FROM' 
  | 'SHARED_DEVICE' 
  | 'SHARED_PHONE' 
  | 'COMMON_BENEFICIARY' 
  | 'LOCATED_AT' 
  | 'CONNECTED_TO' 
  | 'REPORTED_IN' 
  | 'INVOLVED_IN';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ExplainableIndicator {
  indicator: string;
  value: string;
  weight: number;
  contribution: number;
  confidence: number;
  description: string;
}

export interface EntityBreakdown {
  accounts: number;
  upis: number;
  devices: number;
  phones: number;
  merchants: number;
  beneficiaries: number;
  incidents: number;
  ips: number;
  locations: number;
}

export interface FraudCluster {
  clusterId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  entityCount: number;
  transactionCount: number;
  exposure: number;
  growthRate: number;
  firstDetected: string;
  lastActivity: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'MONITORING' | 'RESOLVED';
  entityBreakdown: EntityBreakdown;
  indicators: ExplainableIndicator[];
  entityIds: string[];
  transactionIds: string[];
  incidentIds: string[];
}

export interface IntegrationContract {
  clusterId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  entityCount: number;
  transactionCount: number;
  exposure: number;
  growthRate: number;
  firstDetected: string;
  lastActivity: string;
  status: string;
}

export interface ClusterGrowthPoint {
  timestamp: string;
  dateLabel: string;
  entityCount: number;
  transactionCount: number;
  cumulativeExposure: number;
}

export interface GraphNode {
  data: {
    id: string;
    label: string;
    type: EntityType;
    riskLevel: RiskLevel;
    riskScore: number;
    transactionCount?: number;
    lastActivity?: string;
    clusterId?: string;
    details?: Record<string, any>;
  };
}

export interface GraphEdge {
  data: {
    id: string;
    source: string;
    target: string;
    label: string;
    relationshipType: RelationshipType;
    confidence: number;
    timestamp: string;
    isSuspicious?: boolean;
    metadata?: Record<string, any>;
  };
}

export interface ClusterNetworkGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NormalizedTransaction {
  transactionId: string;
  timestamp: string;
  senderAccountId: string;
  receiverAccountId: string;
  senderUpiId?: string;
  receiverUpiId?: string;
  deviceId?: string;
  phoneHash?: string;
  amount: number;
  currency: string;
  merchantId?: string;
  channel: string;
  status: string;
  location: { city: string; state: string; ipHash?: string };
  beneficiaryId?: string;
}

export interface TopKpis {
  activeClusters: number;
  criticalClusters: number;
  newlyDetected: number;
  connectedEntities: number;
  suspiciousTransactions: number;
  suspiciousExposure: number;
}

export interface DataSourceStatus {
  activeAdapter: string;
  dataSourceEnv: string;
  isLiveFeed: boolean;
  availableAdapters: Array<{
    id: string;
    name: string;
    type: string;
    active: boolean;
    ready: boolean;
    description: string;
  }>;
  totalEntitiesTracked: number;
  totalEdgesTracked: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  clusterId?: string;
  details: Record<string, any>;
}
