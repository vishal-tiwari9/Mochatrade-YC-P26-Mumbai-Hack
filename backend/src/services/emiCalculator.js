// Single source of truth for EMI math. Backend-only — the frontend must
// never recompute this; it only displays whatever the backend returns.

function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Standard reducing-balance amortization formula:
 *   EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * where r is the *monthly* rate (annualRatePct / 12 / 100).
 */
function calculateEmi(principal, annualRatePct, tenureMonths) {
  if (!principal || principal <= 0 || !tenureMonths || tenureMonths <= 0) return 0;
  if (!annualRatePct || annualRatePct <= 0) return round2(principal / tenureMonths);

  const r = annualRatePct / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  const emi = (principal * r * factor) / (factor - 1);
  return round2(emi);
}

/**
 * Inverse of calculateEmi: the largest principal that can be serviced by a
 * given monthly EMI budget, at the same rate/tenure. Used to derive the
 * maximum eligible loan amount from the applicant's spare EMI capacity.
 */
function maxPrincipalForEmi(emiBudget, annualRatePct, tenureMonths) {
  if (!emiBudget || emiBudget <= 0 || !tenureMonths || tenureMonths <= 0) return 0;
  if (!annualRatePct || annualRatePct <= 0) return round2(emiBudget * tenureMonths);

  const r = annualRatePct / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  const principal = (emiBudget * (factor - 1)) / (r * factor);
  return round2(principal);
}

module.exports = { calculateEmi, maxPrincipalForEmi, round2 };
