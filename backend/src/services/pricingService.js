const { calculateEmi, maxPrincipalForEmi } = require("./emiCalculator");
const { riskBandFor } = require("./riskBand");

const FOIR_CAP = 0.5; // Max total obligation (existing + EMI) as a fraction of monthly income
const DEFAULT_TENURE_MONTHS = 60;
const MIN_RATE_PCT = 1;
const MAX_RATE_PCT = 36;

/**
 * Eligible loan cap, quoted rate, and risk grade for non-reject cases.
 *
 * The rate starts from the CIBIL band (riskBandFor), then any *triggered*
 * PRICING-category rules adjust it — e.g. a rule "cibilScore < 650 ->
 * +2 rateAdjustmentPct" only applies if that applicant actually matched it.
 * `triggeredPricingRules` is passed in from the same rule-evaluation pass
 * the rest of the engine already ran (ruleEngine.js) — this function does
 * not re-evaluate rule conditions itself, it only applies the adjustments
 * for rules the engine already confirmed triggered.
 */
function calculateEligibility(rawFinancials = {}, normalizedMetrics = {}, finalStatus, triggeredPricingRules = []) {
  const { riskGrade, rateOfInterest: baseRateOfInterest } = riskBandFor(rawFinancials.cibilScore);

  if (finalStatus === "HARD_REJECT" || finalStatus === "INSUFFICIENT_DATA") {
    return {
      maxEligibleLoanAmount: 0,
      rateOfInterest: null,
      baseRateOfInterest: null,
      pricingAdjustmentPct: 0,
      riskGrade: "CRITICAL",
      eligibleEmi: 0,
    };
  }

  const {
    monthlyIncome = 0,
    existingObligations = 0,
    requestedAmount = 0,
    tenureMonths = DEFAULT_TENURE_MONTHS,
  } = rawFinancials;

  const pricingAdjustmentPct = triggeredPricingRules.reduce(
    (sum, rule) => sum + (Number(rule.rateAdjustmentPct) || 0),
    0
  );

  // Clamped so a misconfigured rule (e.g. -50%) can't produce a nonsensical
  // or negative rate — same spirit as the hard-reject/exception ladder never
  // letting a pricing rule override a reject, just applied to the number line.
  const rateOfInterest =
    baseRateOfInterest === null
      ? null
      : Math.min(MAX_RATE_PCT, Math.max(MIN_RATE_PCT, baseRateOfInterest + pricingAdjustmentPct));

  const emiBudget = Math.max(monthlyIncome * FOIR_CAP - existingObligations, 0);
  const maxLoanByCapacity = maxPrincipalForEmi(emiBudget, rateOfInterest, tenureMonths);
  const maxEligibleLoanAmount = Math.round(Math.min(maxLoanByCapacity, requestedAmount));
  const eligibleEmi = calculateEmi(maxEligibleLoanAmount, rateOfInterest, tenureMonths);

  return { maxEligibleLoanAmount, rateOfInterest, baseRateOfInterest, pricingAdjustmentPct, riskGrade, eligibleEmi };
}

module.exports = { calculateEligibility };
