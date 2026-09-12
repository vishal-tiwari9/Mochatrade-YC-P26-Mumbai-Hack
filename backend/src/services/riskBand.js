// Single source of truth for CIBIL -> risk grade / interest rate banding.
// Used by both normalizer.js (to price the proposed EMI before rules run)
// and pricingService.js (to price the final eligible amount), so the rate
// used in FOIR and the rate quoted in the offer are always the same number.

function riskBandFor(cibilScore) {
  if (!cibilScore || cibilScore < 550) return { riskGrade: "CRITICAL", rateOfInterest: null };
  if (cibilScore >= 750) return { riskGrade: "LOW", rateOfInterest: 10.5 };
  if (cibilScore >= 700) return { riskGrade: "MEDIUM", rateOfInterest: 12.0 };
  if (cibilScore >= 650) return { riskGrade: "HIGH", rateOfInterest: 13.5 };
  return { riskGrade: "HIGH", rateOfInterest: 14.0 };
}

module.exports = { riskBandFor };
