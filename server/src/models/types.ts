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

export interface LocationInfo {
  city: string;
  state: string;
  ipHash?: string;
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
  channel: 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'CARD';
  status: 'SUCCESS' | 'FAILED' | 'FLAGGED';
  location: LocationInfo;
  beneficiaryId?: string;
}

export interface NormalizedEntity {
  id: string; // e.g. "ACCOUNT:ACC001", "DEVICE:DEV029"
  type: EntityType;
  originalId: string;
  firstSeen: string;
  lastSeen: string;
  riskScore: number;
  riskLevel: RiskLevel;
  metadata: Record<string, any>;
}

export interface NormalizedRelationship {
  id: string;
  source: string; // Canonical entity ID
  target: string; // Canonical entity ID
  relationshipType: RelationshipType;
  confidence: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface FraudIncident {
  incidentId: string;
  reportedAt: string;
  category: 'MULE_NETWORK' | 'IDENTITY_THEFT' | 'PHISHING' | 'SIM_SWAP' | 'CHARGEBACK_RING';
  description: string;
  reportedLoss: number;
  involvedEntityIds: string[];
  status: 'CONFIRMED' | 'UNDER_REVIEW' | 'ARCHIVED';
}

export interface ExplainableIndicator {
  indicator: string;
  value: string;
  weight: number; // percentage (e.g. 25)
  contribution: number; // calculated points towards risk score
  confidence: number; // 0.0 - 1.0
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
  growthRate: number; // e.g. 467 (%)
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

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  clusterId?: string;
  details: Record<string, any>;
}
