const mongoose = require("mongoose");

const TriggeredRuleSchema = new mongoose.Schema(
  {
    ruleCode: { type: String, required: true },
    ruleName: { type: String, required: true },
    category: { type: String, required: true },
    metric: { type: String },
    operator: { type: String },
    actualValue: { type: mongoose.Schema.Types.Mixed },
    thresholdValue: { type: mongoose.Schema.Types.Mixed },
    action: { type: String },
    reasonCode: { type: String },
    severity: { type: String },
    priority: { type: Number },
    ruleVersion: { type: Number },
    rateAdjustmentPct: { type: Number },
    passed: { type: Boolean, required: true },
  },
  { _id: false }
);

const MetricMetaSchema = new mongoose.Schema(
  {
    value: { type: mongoose.Schema.Types.Mixed, default: null },
    available: { type: Boolean, default: false },
    source: { type: String },
    description: { type: String },
  },
  { _id: false }
);

const StatusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    updatedBy: { type: String, required: true },
    updatedByRole: { type: String },
    note: { type: String },
    previousStatus: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ApplicantSchema = new mongoose.Schema(
  {
    applicantId: { type: String, required: true, unique: true, index: true },
    assignedToRMId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },

    personalDetails: {
      fullName: { type: String, required: true },
      panNumber: { type: String, required: true },
      phone: { type: String },
      email: { type: String },
      age: { type: Number },
      employmentType: {
        type: String,
        enum: ["SALARIED", "SELF_EMPLOYED", "BUSINESS"],
      },
    },

    rawFinancials: {
      monthlyIncome: { type: Number },
      existingObligations: { type: Number },
      requestedAmount: { type: Number, required: true },
      tenureMonths: { type: Number },
      businessVintageMonths: { type: Number },
      cibilScore: { type: Number },
      hasWriteOff: { type: Boolean, default: false },
      dpd90Count: { type: Number, default: 0 },
      bounceCountLast6M: { type: Number, default: 0 },
      avgMonthlyBalance: { type: Number },
      itrYear1: { type: Number },
      itrYear2: { type: Number },

      // Bureau data beyond the score itself
      activeLoansCount: { type: Number, default: 0 },
      creditEnquiriesCount: { type: Number, default: 0 },
      overdueAmount: { type: Number, default: 0 },
      hasSettlement: { type: Boolean, default: false },
      hasDefault: { type: Boolean, default: false },

      // Bank statement data beyond balance/bounces
      monthlyCreditsAvg: { type: Number },
      emiDebitsFromStatement: { type: Number },
      cashFlowVolatilityPct: { type: Number },

      // Assets — captured as a breakdown; declaredAssets is derived as their
      // sum (see underwritingController.js) so every existing consumer of
      // declaredAssets keeps working unchanged.
      mutualFundsValue: { type: Number, default: 0 },
      equitiesValue: { type: Number, default: 0 },
      otherAssetsValue: { type: Number, default: 0 },
      declaredAssets: { type: Number, default: 0 },
    },

    normalizedMetrics: {
      foir: { type: Number },
      incomeTrendPct: { type: Number },
      incomeStability: { type: String },
      obligationRatio: { type: Number },
      bounceRatio: { type: Number },
      assetToLoanRatio: { type: Number },
      loanToIncomeRatio: { type: Number },
      proposedEmi: { type: Number },
      eligibleEmi: { type: Number },
      maxEligibleLoanAmount: { type: Number },
      riskGrade: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
      rateOfInterest: { type: Number },
      baseRateOfInterest: { type: Number },
      pricingAdjustmentPct: { type: Number, default: 0 },

      // Advisory ML signal — one more input the deterministic rule engine
      // can reference (see ruleEngine.js), never a decision authority itself.
      mlRiskScore: { type: Number },
      mlRiskGrade: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
      mlTopFactors: { type: mongoose.Schema.Types.Mixed },
      mlModelVersion: { type: String },
    },

    metricsMeta: { type: mongoose.Schema.Types.Mixed, default: {} },

    evaluation: {
      status: {
        type: String,
        enum: [
          "APPROVED",
          "HARD_REJECT",
          "EXCEPTION_L1",
          "EXCEPTION_L2",
          "INSUFFICIENT_DATA",
          "PENDING_REVIEW",
        ],
        default: "PENDING_REVIEW",
      },
      decisionSummary: { type: String },
      triggeredRules: { type: [TriggeredRuleSchema], default: [] },
      deviationsCount: { type: Number, default: 0 },
      autoEscalated: { type: Boolean, default: false },
      exceptionLevelRequired: {
        type: String,
        enum: ["NONE", "L1", "L2"],
        default: "NONE",
      },
      ruleEngineVersionUsed: { type: Number },
    },

    statusHistory: { type: [StatusHistorySchema], default: [] },

    // Idempotency guard — see underwritingController.evaluateApplication.
    lastRequestHash: { type: String },
    lastRequestAt: { type: Date },
  },
  { timestamps: true }
);

ApplicantSchema.index({ "evaluation.status": 1 });

module.exports = mongoose.model("Applicant", ApplicantSchema);
