const { calculateEmi, round2 } = require("./emiCalculator");
const { riskBandFor } = require("./riskBand");

const REQUIRED_FIELDS = ["monthlyIncome", "requestedAmount", "cibilScore"];
const DEFAULT_TENURE_MONTHS = 60;

function metric(value, { available, source, description }) {
  return { value: available ? value : null, available, source, description };
}

/**
 * Normalizes raw applicant financials into the metric set the rule engine
 * and pricing service consume. Every metric is returned with its
 * availability and source so the UI can render "N/A — no data" honestly
 * instead of silently defaulting.
 */
function normalizeApplicantData(rawFinancials = {}, requestedAmount) {
  const candidate = { ...rawFinancials, requestedAmount };

  const missingFields = REQUIRED_FIELDS.filter(
    (field) => candidate[field] === undefined || candidate[field] === null
  );

  if (missingFields.length > 0) {
    return { status: "INSUFFICIENT_DATA", missingFields };
  }

  const {
    monthlyIncome,
    existingObligations = 0,
    tenureMonths = DEFAULT_TENURE_MONTHS,
    cibilScore,
    itrYear1,
    itrYear2,
    bounceCountLast6M,
    declaredAssets,
  } = rawFinancials;

  const { rateOfInterest } = riskBandFor(cibilScore);
  const proposedEmi = calculateEmi(requestedAmount, rateOfInterest, tenureMonths);
  const totalObligations = existingObligations + proposedEmi;
  const foir = round2((totalObligations / monthlyIncome) * 100);
  const obligationRatio = round2((existingObligations / monthlyIncome) * 100);

  const hasIncomeTrend = itrYear1 !== undefined && itrYear1 !== null && itrYear1 !== 0 &&
    itrYear2 !== undefined && itrYear2 !== null;
  const incomeTrendPct = hasIncomeTrend ? round2(((itrYear2 - itrYear1) / itrYear1) * 100) : 0;
  const incomeStability = !hasIncomeTrend
    ? "UNKNOWN"
    : incomeTrendPct > 5
      ? "GROWING"
      : incomeTrendPct < -5
        ? "DECLINING"
        : "STABLE";

  const hasBounces = bounceCountLast6M !== undefined && bounceCountLast6M !== null;
  const bounceRatio = hasBounces ? round2(bounceCountLast6M / 6) : null;

  const hasAssets = declaredAssets !== undefined && declaredAssets !== null;
  const assetToLoanRatio = hasAssets && requestedAmount > 0
    ? round2(declaredAssets / requestedAmount)
    : null;

  const loanToIncomeRatio = round2(requestedAmount / (monthlyIncome * 12));

  const normalizedMetrics = {
    foir,
    proposedEmi,
    incomeTrendPct,
    obligationRatio,
    incomeStability,
    bounceRatio,
    assetToLoanRatio,
    loanToIncomeRatio,
  };

  const metricsMeta = {
    foir: metric(foir, { available: true, source: "calculated", description: "(existing obligations + proposed EMI) / monthly income" }),
    proposedEmi: metric(proposedEmi, { available: true, source: "calculated", description: "Amortized EMI on requested amount at the CIBIL-banded rate" }),
    incomeTrendPct: metric(incomeTrendPct, { available: hasIncomeTrend, source: hasIncomeTrend ? "calculated" : "unavailable", description: "YoY change, ITR year 1 to year 2" }),
    incomeStability: metric(incomeStability, { available: hasIncomeTrend, source: hasIncomeTrend ? "derived" : "unavailable", description: "Qualitative read of incomeTrendPct" }),
    obligationRatio: metric(obligationRatio, { available: true, source: "calculated", description: "Existing obligations / monthly income (excludes proposed EMI)" }),
    bounceRatio: metric(bounceRatio, { available: hasBounces, source: hasBounces ? "calculated" : "unavailable", description: "Bounces in last 6 months / 6" }),
    assetToLoanRatio: metric(assetToLoanRatio, { available: assetToLoanRatio !== null, source: assetToLoanRatio !== null ? "calculated" : "unavailable", description: "Declared assets / requested loan amount" }),
    loanToIncomeRatio: metric(loanToIncomeRatio, { available: true, source: "calculated", description: "Requested amount / annualized monthly income" }),
    creditUtilization: metric(null, { available: false, source: "unavailable", description: "No credit-limit data captured for this applicant type" }),
  };

  return { status: "SUCCESS", normalizedMetrics, metricsMeta };
}

module.exports = { normalizeApplicantData };
