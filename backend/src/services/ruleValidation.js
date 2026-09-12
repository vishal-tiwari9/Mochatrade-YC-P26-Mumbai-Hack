// Value-constraint validation for BRE policy (Rule) definitions.
//
// This is deliberately separate from ruleEngine.js: this module protects the
// *configuration* (can an admin save a nonsensical policy?), while
// ruleEngine.js evaluates already-saved, already-valid policies against an
// applicant. Three tiers, per the product spec:
//   errors   -> objectively invalid, blocks Save
//   warnings -> unusual but potentially legitimate, Save is still allowed
//
// METRIC_SPECS is the single source of truth for objective (hard) bounds and
// "unusually high/low" (warning) thresholds. Metrics not listed here (e.g. a
// future custom metric) get no hard-limit enforcement, only the generic
// checks (finite number, required fields) — we never invent an arbitrary cap
// for a metric we don't have institutional guidance on.

const BOOLEAN_METRICS = ["hasWriteOff", "hasSettlement", "hasDefault"];
const NUMERIC_OPERATORS = ["<", "<=", ">", ">=", "==", "!="];
const BOOLEAN_OPERATORS = ["==", "!="];
const CATEGORIES = ["HARD_REJECT", "EXCEPTION_L1", "EXCEPTION_L2", "PRICING"];

const METRIC_SPECS = {
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

const RECOMMENDED_ACTION_BY_CATEGORY = {
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

function formatBound(value, unit) {
  return unit ? `${value}${unit}` : String(value);
}

function checkMetricValue(metric, thresholdValue, errors, warnings) {
  const spec = METRIC_SPECS[metric];
  if (!spec) return; // unknown/custom metric — no institutional bound to enforce

  const value = Number(thresholdValue);
  if (!Number.isFinite(value)) {
    errors.push(`${spec.label} threshold must be a valid number.`);
    return;
  }

  switch (spec.kind) {
    case "range":
      if (value < spec.min || value > spec.max) {
        errors.push(`${spec.label} must be between ${formatBound(spec.min, spec.unit)} and ${formatBound(spec.max, spec.unit)}.`);
        return;
      }
      break;
    case "positive":
      if (value <= 0) {
        errors.push(`${spec.label} must be greater than 0.`);
        return;
      }
      break;
    case "nonNegative":
      if (value < 0) {
        errors.push(`${spec.label} cannot be negative.`);
        return;
      }
      break;
    case "nonNegativeInt":
      if (value < 0 || !Number.isInteger(value)) {
        errors.push(`${spec.label} must be a whole number of 0 or greater.`);
        return;
      }
      break;
  }

  if (spec.warnBelow !== undefined && value < spec.warnBelow) {
    warnings.push(`This ${spec.label} threshold (${value}) is unusually low and may allow high-risk applicants. Please verify.`);
  }
  if (spec.warnAbove !== undefined && value > spec.warnAbove) {
    warnings.push(`This ${spec.label} threshold (${value}) is unusually high — please verify before saving.`);
  }
}

// Direction in which the metric gets "worse" for the given operator, so we
// can compare severity ordering across rules on the same metric.
//   "low"  -> operator triggers when the value is BELOW the threshold
//             (worse applicants have a lower value, e.g. cibilScore < 650)
//   "high" -> operator triggers when the value is ABOVE the threshold
//             (worse applicants have a higher value, e.g. foir > 65)
function worseDirection(operator) {
  if (operator === "<" || operator === "<=") return "low";
  if (operator === ">" || operator === ">=") return "high";
  return null; // == / != have no meaningful severity ordering
}

const SEVERITY_RANK = { HARD_REJECT: 0, EXCEPTION_L2: 1, EXCEPTION_L1: 2 };

// Cross-rule logical validation: a more severe category's threshold must
// cover a strictly worse (or equal) slice of the metric range than a less
// severe category's threshold on the same metric — otherwise the less
// severe rule becomes partially or fully unreachable (the more severe rule
// always wins per the decision ladder), which means the policy as configured
// doesn't do what its own thresholds imply.
function checkCrossRuleConsistency(draft, otherRules, errors, warnings) {
  const direction = worseDirection(draft.operator);
  if (!direction) return;
  if (!(draft.category in SEVERITY_RANK)) return;

  const draftValue = Number(draft.thresholdValue);
  if (!Number.isFinite(draftValue)) return;

  const draftRank = SEVERITY_RANK[draft.category];

  for (const other of otherRules) {
    if (other.metric !== draft.metric) continue;
    if (!(other.category in SEVERITY_RANK)) continue;
    if (worseDirection(other.operator) !== direction) continue;

    const otherValue = Number(other.thresholdValue);
    if (!Number.isFinite(otherValue)) continue;
    const otherRank = SEVERITY_RANK[other.category];
    if (otherRank === draftRank) continue; // same severity tier — not a severity-ordering conflict

    const [severeCode, severeCat, severeVal, lenientCode, lenientCat, lenientVal] =
      draftRank < otherRank
        ? [draft.ruleCode || "(this rule)", draft.category, draftValue, other.ruleCode, other.category, otherValue]
        : [other.ruleCode, other.category, otherValue, draft.ruleCode || "(this rule)", draft.category, draftValue];

    const overlaps = direction === "low" ? severeVal > lenientVal : severeVal < lenientVal;
    if (overlaps) {
      errors.push(
        `Conflicting ${draft.metric} thresholds: ${severeCat} rule "${severeCode}" (${severeVal}) overlaps with ${lenientCat} rule "${lenientCode}" (${lenientVal}) — the less severe policy would become partly unreachable. Escalation thresholds must get stricter as severity increases.`
      );
    }
  }
}

function checkDuplicatePriority(draft, otherRules, warnings) {
  const dupe = otherRules.find((r) => r.isActive !== false && Number(r.priority) === Number(draft.priority));
  if (dupe) {
    warnings.push(`Another active rule ("${dupe.ruleCode}") has the same execution priority (${draft.priority}). Verify this doesn't create ambiguous ordering.`);
  }
}

function validateRuleDraft(draft, otherRules = []) {
  const errors = [];
  const warnings = [];

  // 13. Required fields
  const requiredFields = ["ruleCode", "name", "category", "metric", "operator", "action", "reasonCode"];
  for (const field of requiredFields) {
    if (draft[field] === undefined || draft[field] === null || String(draft[field]).trim() === "") {
      errors.push(`${field} is required.`);
    }
  }
  if (draft.thresholdValue === undefined || draft.thresholdValue === null || draft.thresholdValue === "") {
    errors.push("thresholdValue is required.");
  }
  if (draft.priority === undefined || draft.priority === null || draft.priority === "") {
    errors.push("priority is required.");
  }
  if (errors.length) return { errors, warnings }; // no point validating further without the basics

  // Category / operator enums (defense in depth; schema also enforces these)
  if (!CATEGORIES.includes(draft.category)) {
    errors.push(`category must be one of ${CATEGORIES.join(", ")}.`);
  }

  const isBoolean = BOOLEAN_METRICS.includes(draft.metric);
  const legalOperators = isBoolean ? BOOLEAN_OPERATORS : NUMERIC_OPERATORS;
  if (!legalOperators.includes(draft.operator)) {
    errors.push(
      isBoolean
        ? `${draft.metric} is a true/false metric — operator must be "==" or "!=".`
        : `"${draft.operator}" is not a valid operator for ${draft.metric}.`
    );
  }

  // 1/2/9/14 — per-metric hard limits & warning ranges
  if (isBoolean) {
    if (typeof draft.thresholdValue !== "boolean") {
      errors.push(`${draft.metric} threshold must be true or false.`);
    }
  } else {
    checkMetricValue(draft.metric, draft.thresholdValue, errors, warnings);
  }

  // 8. Priority
  const priority = Number(draft.priority);
  if (!Number.isFinite(priority) || priority < PRIORITY_MIN || priority > PRIORITY_MAX) {
    errors.push(`Priority must be between ${PRIORITY_MIN} and ${PRIORITY_MAX}.`);
  }

  // PRICING rate adjustment bounds
  if (draft.category === "PRICING") {
    const rate = Number(draft.rateAdjustmentPct ?? 0);
    if (!Number.isFinite(rate) || rate < RATE_ADJUSTMENT_MIN || rate > RATE_ADJUSTMENT_MAX) {
      errors.push(`Rate adjustment must be between ${RATE_ADJUSTMENT_MIN} and ${RATE_ADJUSTMENT_MAX} percentage points.`);
    } else if (Math.abs(rate) > RATE_ADJUSTMENT_WARN_ABS) {
      warnings.push(`This rate adjustment (${rate}%) is unusually high and may create an unrealistic interest rate. Please verify.`);
    }
  }

  if (errors.length) return { errors, warnings };

  // 3/4/5/6/7 — logical & cross-rule consistency (only meaningful once the
  // single-rule checks above already passed)
  checkCrossRuleConsistency(draft, otherRules, errors, warnings);

  // 8. Duplicate priority
  checkDuplicatePriority(draft, otherRules, warnings);

  // 11. Action vs. category
  const recommendedAction = RECOMMENDED_ACTION_BY_CATEGORY[draft.category];
  if (recommendedAction && draft.action !== recommendedAction) {
    warnings.push(`${draft.category} rules normally use the "${recommendedAction}" action; "${draft.action}" is unusual here. Please verify.`);
  }

  // 12. Severity vs. category
  if (draft.category === "HARD_REJECT" && draft.severity === "LOW") {
    warnings.push("A HARD_REJECT rule is normally expected to have HIGH or CRITICAL severity. Please verify.");
  }

  return { errors, warnings };
}

module.exports = { validateRuleDraft, METRIC_SPECS, BOOLEAN_METRICS };
