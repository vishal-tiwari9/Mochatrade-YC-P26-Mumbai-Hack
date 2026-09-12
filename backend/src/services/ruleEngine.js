const OPERATORS = {
  "<": (a, b) => a < b,
  "<=": (a, b) => a <= b,
  ">": (a, b) => a > b,
  ">=": (a, b) => a >= b,
  "==": (a, b) => a === b,
  "!=": (a, b) => a !== b,
};

// ---------------------------------------------------------------------------
// Decision priority ladder (highest wins):
//
//   HARD_REJECT  >  EXCEPTION_L2  >  EXCEPTION_L1  >  APPROVED
//
// A PRICING-category rule never appears in this ladder — it can only adjust
// rate, never override a reject/exception outcome. Two or more independent
// EXCEPTION_L1 triggers auto-escalate to EXCEPTION_L2 (compounding
// deviations represent materially higher combined risk than any one alone).
// ---------------------------------------------------------------------------

const CATEGORY_PRIORITY = {
  HARD_REJECT: 0,
  EXCEPTION_L2: 1,
  EXCEPTION_L1: 2,
  PRICING: 3,
};

const MULTI_L1_ESCALATION_THRESHOLD = 2;

function evaluateRules(applicantData, activeRules) {
  const triggeredRules = [];

  const sortedRules = [...activeRules].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));

  for (const rule of sortedRules) {
    const compare = OPERATORS[rule.operator];
    if (!compare) continue;

    const actualValue = applicantData[rule.metric];
    if (actualValue === undefined || actualValue === null) continue;

    const triggered = compare(actualValue, rule.thresholdValue);
    if (triggered) {
      triggeredRules.push({
        ruleCode: rule.ruleCode,
        ruleName: rule.name,
        category: rule.category,
        metric: rule.metric,
        operator: rule.operator,
        actualValue,
        thresholdValue: rule.thresholdValue,
        action: rule.action,
        reasonCode: rule.reasonCode,
        severity: rule.severity || "MEDIUM",
        priority: rule.priority ?? 100,
        ruleVersion: rule.version,
        rateAdjustmentPct: rule.rateAdjustmentPct ?? 0,
        passed: false,
      });
    }
  }

  let finalStatus = "APPROVED";
  let autoEscalated = false;

  if (triggeredRules.some((r) => r.category === "HARD_REJECT")) {
    finalStatus = "HARD_REJECT";
  } else if (triggeredRules.some((r) => r.category === "EXCEPTION_L2")) {
    finalStatus = "EXCEPTION_L2";
  } else {
    const l1Count = triggeredRules.filter((r) => r.category === "EXCEPTION_L1").length;
    if (l1Count >= MULTI_L1_ESCALATION_THRESHOLD) {
      finalStatus = "EXCEPTION_L2";
      autoEscalated = true;
    } else if (l1Count > 0) {
      finalStatus = "EXCEPTION_L1";
    }
  }

  triggeredRules.sort(
    (a, b) => CATEGORY_PRIORITY[a.category] - CATEGORY_PRIORITY[b.category] || a.priority - b.priority
  );

  return {
    finalStatus,
    triggeredRules,
    deviationsCount: triggeredRules.length,
    autoEscalated,
  };
}

module.exports = { evaluateRules, OPERATORS, MULTI_L1_ESCALATION_THRESHOLD };
