export type ChannelType = 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'WALLET';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'FLAGGED' | 'SUSPICIOUS';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AttackRole = 
  | 'source' 
  | 'intermediate' 
  | 'mule' 
  | 'consolidation' 
  | 'destination' 
  | 'known_fraud';

export interface Transaction {
  transactionId: string;
  timestamp: string; // ISO 8601
  senderAccountId: string;
  receiverAccountId: string;
  senderUpiId: string;
  receiverUpiId: string;
  amount: number;
  currency: string;
  channel: ChannelType;
  merchantId?: string;
  deviceId?: string;
  status: TransactionStatus;
  narrative?: string;
  riskScore?: number;
}

export interface Account {
  accountId: string;
  accountHolder: string;
  bankName: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'NODAL' | 'MERCHANT';
  riskScore: number;
  kycStatus: 'VERIFIED' | 'PARTIAL' | 'FLAGGED';
  phoneHash: string;
  deviceIds: string[];
  upiIds: string[];
  createdTimestamp: string;
  relatedClusterId?: string;
  status: 'ACTIVE' | 'FROZEN' | 'UNDER_REVIEW';
  initialBalance?: number;
}

export interface UPIEntity {
  upiId: string;
  associatedAccountId: string;
  vpaHandle: string;
  riskScore: number;
  status: 'ACTIVE' | 'SUSPICIOUS' | 'BLOCKED';
}

export interface Beneficiary {
  beneficiaryId: string;
  name: string;
  accountNumberMasked: string;
  ifscCode: string;
  bankName: string;
  riskLevel: RiskLevel;
  relatedClusterId?: string;
}

export interface FraudIncident {
  incidentId: string;
  category: string;
  description: string;
  reportedAt: string;
  lossAmountINR: number;
  associatedAccounts: string[];
  associatedUpiIds: string[];
  status: 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'CLOSED';
}

export interface PathNode {
  id: string;
  label: string;
  entityType: 'ACCOUNT' | 'UPI' | 'BENEFICIARY' | 'MERCHANT' | 'DEVICE' | 'FRAUD_INCIDENT';
  role: AttackRole;
  roleLabel: string;
  riskScore: number;
  amountReceived: number;
  amountSent: number;
  amountRetained: number;
  retentionRatePercent: number;
  data: Partial<Account> & {
    upiId?: string;
    beneficiaryName?: string;
    incidentCategory?: string;
    bankName?: string;
  };
}

export interface PathEdge {
  id: string;
  source: string;
  target: string;
  transactionId: string;
  amount: number;
  timestamp: string;
  channel: ChannelType;
  status: TransactionStatus;
  timeDiffMinutes: number;
  isSuspicious: boolean;
}

export interface RetentionStage {
  nodeId: string;
  label: string;
  role: string;
  roleLabel: string;
  received: number;
  sent: number;
  retained: number;
  retentionRatePercent: number;
}

export interface FanOutPattern {
  sourceAccountId: string;
  sourceLabel: string;
  destinationsCount: number;
  destinations: string[];
  totalOutgoing: number;
  timeWindowMinutes: number;
  description: string;
}

export interface FanInPattern {
  targetAccountId: string;
  targetLabel: string;
  sourcesCount: number;
  sources: string[];
  totalIncoming: number;
  timeWindowMinutes: number;
  description: string;
}

export interface CircularFlowPattern {
  cycleLength: number;
  cycleAccounts: string[];
  totalCycleAmount: number;
  timeSpanMinutes: number;
  transactionIds: string[];
  description: string;
}

export interface RiskFactor {
  factor: string;
  points: number;
  rationale: string;
}

export interface MoneyFlowPath {
  pathId: string;
  sourceEntity: string;
  destinationEntity: string;
  sourceLabel: string;
  destinationLabel: string;
  totalAmount: number;
  transactionCount: number;
  hopCount: number;
  durationMinutes: number;
  riskScore: number;
  riskLevel: RiskLevel;
  relatedClusterId: string;
  status: 'REQUIRES_INVESTIGATION' | 'VERIFIED_SUSPICIOUS' | 'CLEARED';
  nodes: PathNode[];
  edges: PathEdge[];
  transactions: Transaction[];
  retentionAnalysis: RetentionStage[];
  fanOutPatterns: FanOutPattern[];
  fanInPatterns: FanInPattern[];
  circularFlows: CircularFlowPattern[];
  riskBreakdown: RiskFactor[];
}

export interface TraceQueryResult {
  source: string;
  direction: 'outgoing' | 'incoming' | 'both';
  maxHops: number;
  totalAmount: number;
  hopCount: number;
  pathRiskScore: number;
  riskLevel: RiskLevel;
  nodes: PathNode[];
  transactions: Transaction[];
  paths: MoneyFlowPath[];
  activePath: MoneyFlowPath | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  details: any;
  investigatorId: string;
}

export interface FraudNexusIntegrationContract {
  pathId: string;
  sourceEntity: string;
  destinationEntity: string;
  totalAmount: number;
  transactionCount: number;
  hopCount: number;
  durationMinutes: number;
  riskScore: number;
  riskLevel: RiskLevel;
  relatedClusterId: string;
  status: 'REQUIRES_INVESTIGATION' | 'VERIFIED_SUSPICIOUS' | 'CLEARED';
}
