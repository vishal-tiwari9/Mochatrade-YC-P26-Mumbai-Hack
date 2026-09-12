// Client-side mirror of backend/src/services/ruleValidation.js — gives the
// admin instant feedback while typing. The backend re-validates everything
// authoritatively (including cross-rule checks, which need the full rule
// list) before anything is ever saved to MongoDB, so this file only needs to
// cover the single-rule checks that don't require server data.

import type { RuleDraft } from "@/types";

export const BOOLEAN_METRICS = ["hasWriteOff", "hasSettlement", "hasDefault"];
const NUMERIC_OPERATORS = ["<", "<=", ">", ">=", "==", "!="];
const BOOLEAN_OPERATORS = ["==", "!="];

interface MetricSpec {
  kind: "range" | "positive" | "nonNegative" | "nonNegativeInt";
  min?: number;
  max?: number;
  warnBelow?: number;
  warnAbove?: number;
  label: string;
  unit?: string;
}

export const METRIC_SPECS: Record<string, MetricSpec> = {
  cibilScore: { kind: "range", min: 0, max: 900, warnBelow: 500, label: "CIBIL score" },
  foir: { kind: "range", min: 0, max: 100, warnAbove: 65, label: "FOIR", unit: "%" },
  obligationRatio: { kind: "range", min: 0, max: 100, warnAbove: 65, label: "Obligation ratio", unit: "%" },
  cashFlowVolatilityPct: { kind: "range", min: 0, max: 100, warnAbove: 50, label: "Cash-flow volatility", unit: "%" },
  mlRiskScore: { kind: "range", min: 0, max: 1, label: "ML risk score" },
  requestedAmount: { kind: "positive", warnAbove: 50000000, label: "Loan amount" },
  monthlyIncome: { kind: "positive", warnAbove: 5000000, label: "Monthly income" },
  declaredAssets: { kind: "nonNegative", label: "Declared assets" },
  avgMonthlyBalance: { kind: "nonNegative", label: "Avg. monthly balance" },
  monthlyCreditsAvg: { kind: "nonNegative", label: "Avg. monthly credits" },
  emiDebitsFromStatement: { kind: "nonNegative", label: "EMI debits (statement)" },
  overdueAmount: { kind: "nonNegative", warnAbove: 1000000, label: "Overdue amount" },
  dpd90Count: { kind: "nonNegativeInt", warnAbove: 12, label: "DPD count" },
  bounceCountLast6M: { kind: "nonNegativeInt", warnAbove: 6, label: "Bounce count (6M)" },
  activeLoansCount: { kind: "nonNegativeInt", warnAbove: 15, label: "Active loans count" },
  creditEnquiriesCount: { kind: "nonNegativeInt", warnAbove: 20, label: "Credit enquiries count" },
};

const RECOMMENDED_ACTION_BY_CATEGORY: Record<string, string> = {
  HARD_REJECT: "REJECT",
  EXCEPTION_L1: "FLAG_L1",
  EXCEPTION_L2: "FLAG_L2",
  PRICING: "ADJUST_RATE",
};

const PRIORITY_MIN = 1;
const PRIORITY_MAX = 100;
const RATE_ADJUSTMENT_MIN = -50;
const RATE_ADJUSTMENT_MAX = 50;
const RATE_ADJUSTMENT_WARN_ABS = 10;

function formatBound(value: number, unit?: string) {
  return unit ? `${value}${unit}` : String(value);
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  /** Field-level errors, for showing inline under a specific input */
  fieldErrors: Partial<Record<keyof RuleDraft, string>>;
}

export function validateDraftLocally(draft: RuleDraft): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fieldErrors: Partial<Record<keyof RuleDraft, string>> = {};

  const requiredFields: (keyof RuleDraft)[] = ["ruleCode", "name", "category", "metric", "operator", "action", "reasonCode"];
  for (const field of requiredFields) {
    const value = draft[field];
    if (value === undefined || value === null || String(value).trim() === "") {
      fieldErrors[field] = "Required.";
      errors.push(`${field} is required.`);
    }
  }
  if (draft.thresholdValue === undefined || draft.thresholdValue === null || draft.thresholdValue === ("" as unknown)) {
    fieldErrors.thresholdValue = "Required.";
    errors.push("Threshold value is required.");
  }
  if (draft.priority === undefined || draft.priority === null) {
    fieldErrors.priority = "Required.";
    errors.push("Priority is required.");
  }
  if (errors.length) return { errors, warnings, fieldErrors };

  const isBoolean = BOOLEAN_METRICS.includes(draft.metric);
  const legalOperators = isBoolean ? BOOLEAN_OPERATORS : NUMERIC_OPERATORS;
  if (!legalOperators.includes(draft.operator)) {
    const msg = isBoolean
      ? `${draft.metric} is a true/false metric — operator must be "==" or "!=".`
      : `"${draft.operator}" is not a valid operator for ${draft.metric}.`;
    fieldErrors.operator = msg;
    errors.push(msg);
  }

  if (isBoolean) {
    if (typeof draft.thresholdValue !== "boolean") {
      fieldErrors.thresholdValue = `${draft.metric} threshold must be true or false.`;
      errors.push(fieldErrors.thresholdValue);
    }
  } else {
    const spec = METRIC_SPECS[draft.metric];
    const value = Number(draft.thresholdValue);
    if (spec) {
      if (!Number.isFinite(value)) {
        fieldErrors.thresholdValue = `${spec.label} threshold must be a valid number.`;
        errors.push(fieldErrors.thresholdValue);
      } else {
        let hardFailed = false;
        if (spec.kind === "range" && (value < (spec.min ?? -Infinity) || value > (spec.max ?? Infinity))) {
          fieldErrors.thresholdValue = `${spec.label} must be between ${formatBound(spec.min!, spec.unit)} and ${formatBound(spec.max!, spec.unit)}.`;
          hardFailed = true;
        } else if (spec.kind === "positive" && value <= 0) {
          fieldErrors.thresholdValue = `${spec.label} must be greater than 0.`;
          hardFailed = true;
        } else if (spec.kind === "nonNegative" && value < 0) {
          fieldErrors.thresholdValue = `${spec.label} cannot be negative.`;
          hardFailed = true;
        } else if (spec.kind === "nonNegativeInt" && (value < 0 || !Number.isInteger(value))) {
          fieldErrors.thresholdValue = `${spec.label} must be a whole number of 0 or greater.`;
          hardFailed = true;
        }
        if (hardFailed) {
          errors.push(fieldErrors.thresholdValue!);
        } else {
          if (spec.warnBelow !== undefined && value < spec.warnBelow) {
            warnings.push(`This ${spec.label} threshold (${value}) is unusually low and may allow high-risk applicants. Please verify.`);
          }
          if (spec.warnAbove !== undefined && value > spec.warnAbove) {
            warnings.push(`This ${spec.label} threshold (${value}) is unusually high — please verify before saving.`);
          }
        }
      }
    }
  }

  const priority = Number(draft.priority);
  if (!Number.isFinite(priority) || priority < PRIORITY_MIN || priority > PRIORITY_MAX) {
    fieldErrors.priority = `Priority must be between ${PRIORITY_MIN} and ${PRIORITY_MAX}.`;
    errors.push(fieldErrors.priority);
  }

  if (draft.category === "PRICING") {
    const rate = Number(draft.rateAdjustmentPct ?? 0);
    if (!Number.isFinite(rate) || rate < RATE_ADJUSTMENT_MIN || rate > RATE_ADJUSTMENT_MAX) {
      fieldErrors.rateAdjustmentPct = `Rate adjustment must be between ${RATE_ADJUSTMENT_MIN} and ${RATE_ADJUSTMENT_MAX} percentage points.`;
      errors.push(fieldErrors.rateAdjustmentPct);
    } else if (Math.abs(rate) > RATE_ADJUSTMENT_WARN_ABS) {
      warnings.push(`This rate adjustment (${rate}%) is unusually high and may create an unrealistic interest rate. Please verify.`);
    }
  }

  if (errors.length) return { errors, warnings, fieldErrors };

  const recommendedAction = RECOMMENDED_ACTION_BY_CATEGORY[draft.category];
  if (recommendedAction && draft.action !== recommendedAction) {
    warnings.push(`${draft.category} rules normally use the "${recommendedAction}" action; "${draft.action}" is unusual here. Please verify.`);
  }

  if (draft.category === "HARD_REJECT" && draft.severity === "LOW") {
    warnings.push("A HARD_REJECT rule is normally expected to have HIGH or CRITICAL severity. Please verify.");
  }

  return { errors, warnings, fieldErrors };
}
