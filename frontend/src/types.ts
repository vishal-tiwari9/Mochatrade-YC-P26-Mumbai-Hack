export interface PersonalDetails {
  fullName: string;
  panNumber: string;
  phone?: string;
  email?: string;
  age?: number;
  employmentType?: "SALARIED" | "SELF_EMPLOYED" | "BUSINESS";
}

export interface RawFinancials {
  monthlyIncome?: number;
  existingObligations?: number;
  requestedAmount?: number;
  tenureMonths?: number;
  businessVintageMonths?: number;
  cibilScore?: number;
  hasWriteOff?: boolean;
  dpd90Count?: number;
  bounceCountLast6M?: number;
  avgMonthlyBalance?: number;
  itrYear1?: number;
  itrYear2?: number;

  // Bureau data beyond the score itself
  activeLoansCount?: number;
  creditEnquiriesCount?: number;
  overdueAmount?: number;
  hasSettlement?: boolean;
  hasDefault?: boolean;

  // Bank statement data beyond balance/bounces
  monthlyCreditsAvg?: number;
  emiDebitsFromStatement?: number;
  cashFlowVolatilityPct?: number;

  // Assets breakdown — declaredAssets is derived server-side as their sum
  mutualFundsValue?: number;
  equitiesValue?: number;
  otherAssetsValue?: number;
  declaredAssets?: number;
}

export type RiskGrade = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface NormalizedMetrics {
  foir?: number;
  incomeTrendPct?: number;
  incomeStability?: "GROWING" | "STABLE" | "DECLINING" | "UNKNOWN";
  obligationRatio?: number;
  bounceRatio?: number | null;
  assetToLoanRatio?: number | null;
  loanToIncomeRatio?: number;
  proposedEmi?: number;
  eligibleEmi?: number;
  maxEligibleLoanAmount?: number;
  riskGrade?: RiskGrade;
  rateOfInterest?: number | null;
  baseRateOfInterest?: number | null;
  pricingAdjustmentPct?: number;
  mlRiskScore?: number | null;
  mlRiskGrade?: RiskGrade | null;
  mlTopFactors?: MlFactor[] | null;
  mlModelVersion?: string | null;
}

export interface MlFactor {
  feature: string;
  value: number;
  contribution: number;
  direction: "increases_risk" | "decreases_risk";
}

export interface MlFeatureWeight {
  feature: string;
  coefficient: number;
  description: string;
}

export interface MlModelInfo {
  ready: boolean;
  algorithm?: string;
  trainedAt?: string;
  trainingSamples?: number;
  testSamples?: number;
  accuracy?: number;
  aucRoc?: number;
  features?: string[];
  featureWeights?: MlFeatureWeight[];
  dataSource?: string;
  positiveRate?: number;
  error?: string;
}

export interface MlPredictRequest {
  cibilScore: number;
  foir: number;
  dpd90Count: number;
  bounceCountLast6M: number;
  hasWriteOff: boolean;
  obligationRatio: number;
  loanToIncomeRatio: number;
  assetToLoanRatio: number;
  incomeTrendPct: number;
}

export interface MlPredictResult {
  riskScore: number;
  riskGrade: RiskGrade;
  topFactors: MlFactor[];
  modelVersion: string;
}

export interface MetricMeta {
  value: unknown;
  available: boolean;
  source?: string;
  description?: string;
}

export type MetricsMeta = Record<string, MetricMeta>;

export interface TriggeredRule {
  ruleCode: string;
  ruleName: string;
  category: string;
  metric?: string;
  operator?: string;
  actualValue: unknown;
  thresholdValue: unknown;
  action: string;
  reasonCode: string;
  severity?: string;
  priority?: number;
  ruleVersion?: number;
  rateAdjustmentPct?: number;
  passed: boolean;
}

export type EvaluationStatus =
  | "APPROVED"
  | "HARD_REJECT"
  | "EXCEPTION_L1"
  | "EXCEPTION_L2"
  | "INSUFFICIENT_DATA"
  | "PENDING_REVIEW";

export interface Evaluation {
  status: EvaluationStatus;
  decisionSummary?: string;
  triggeredRules: TriggeredRule[];
  deviationsCount: number;
  autoEscalated?: boolean;
  exceptionLevelRequired: "NONE" | "L1" | "L2";
  ruleEngineVersionUsed: number | null;
}

export interface StatusHistoryEntry {
  status: string;
  updatedBy: string;
  updatedByRole?: string;
  previousStatus?: string;
  note?: string;
  timestamp: string;
}

export interface ApplicantResponse {
  _id: string;
  applicantId: string;
  assignedToRMId?: string;
  personalDetails: PersonalDetails;
  rawFinancials: RawFinancials;
  normalizedMetrics: NormalizedMetrics;
  metricsMeta?: MetricsMeta;
  evaluation: Evaluation;
  statusHistory?: StatusHistoryEntry[];
  missingFields?: string[];
  idempotentReplay?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SimulationResult {
  simulated: true;
  rawFinancials: RawFinancials;
  evaluation: Evaluation;
  normalizedMetrics: NormalizedMetrics;
  metricsMeta?: MetricsMeta;
  missingFields?: string[];
}

export type RuleCategory = "HARD_REJECT" | "EXCEPTION_L1" | "EXCEPTION_L2" | "PRICING";
export type RuleSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RuleRecord {
  _id: string;
  ruleCode: string;
  name: string;
  category: RuleCategory;
  metric: string;
  operator: string;
  thresholdValue: number | boolean | string;
  action: string;
  reasonCode: string;
  description?: string;
  severity: RuleSeverity;
  priority: number;
  /** Only meaningful for category "PRICING" — percentage points added to the base rate when this rule triggers. */
  rateAdjustmentPct?: number;
  version: number;
  isActive: boolean;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RuleDraft {
  ruleCode: string;
  name: string;
  category: RuleCategory;
  metric: string;
  operator: string;
  thresholdValue: number | boolean;
  action: string;
  reasonCode: string;
  description?: string;
  severity: RuleSeverity;
  priority: number;
  rateAdjustmentPct?: number;
  isActive: boolean;
}

export type Role = "RM" | "L1_APPROVER" | "L2_APPROVER" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface DashboardStats {
  totals: {
    applications: number;
    approved: number;
    hardRejected: number;
    exceptionL1: number;
    exceptionL2: number;
    insufficientData: number;
    approvalRate: number;
  };
  funnel: {
    applications: number;
    evaluated: number;
    approved: number;
    exception: number;
    rejected: number;
  };
  riskDistribution: Record<RiskGrade, number>;
  recentApplications: ApplicantResponse[];
  pendingExceptions: ApplicantResponse[];
}

export interface AuditLogEntry {
  _id: string;
  action: "RULE_UPDATE" | "EXCEPTION_DECISION" | "APPLICATION_SUBMISSION" | "SECURITY_VIOLATION";
  actorId: string;
  actorRole: string;
  targetEntity: string;
  targetId?: string;
  previousSnapshot?: unknown;
  newSnapshot?: unknown;
  hash: string;
  prevHash: string;
  timestamp: string;
}

export interface AuditVerifyResult {
  verified: boolean;
  brokenAt: string | null;
  totalEntries: number;
}
