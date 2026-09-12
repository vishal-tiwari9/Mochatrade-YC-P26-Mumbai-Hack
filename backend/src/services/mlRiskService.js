// Calls the Python ML microservice's /api/predict-risk to get an advisory
// default-risk score. This is deliberately fire-and-forget-safe: if the ML
// service is down, slow, or returns malformed data, evaluation must still
// proceed using the deterministic rule engine — mlRiskScore just comes back
// null and any rule referencing it simply won't trigger (evaluateRules
// skips undefined/null metrics). ML is an input signal, never the decision
// authority — see PROBLEM_STATEMENT.md.

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
const REQUEST_TIMEOUT_MS = 3000;

async function getMlRiskScore({ rawFinancials, derivedMetrics }) {
  const features = {
    cibilScore: rawFinancials.cibilScore,
    foir: derivedMetrics.foir ?? 0,
    dpd90Count: rawFinancials.dpd90Count ?? 0,
    bounceCountLast6M: rawFinancials.bounceCountLast6M ?? 0,
    hasWriteOff: Boolean(rawFinancials.hasWriteOff),
    obligationRatio: derivedMetrics.obligationRatio ?? 0,
    loanToIncomeRatio: derivedMetrics.loanToIncomeRatio ?? 0,
    assetToLoanRatio: derivedMetrics.assetToLoanRatio ?? 0,
    incomeTrendPct: derivedMetrics.incomeTrendPct ?? 0,
  };

  if (features.cibilScore === undefined || features.cibilScore === null) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${ML_SERVICE_URL}/api/predict-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`ML risk prediction unavailable (HTTP ${res.status}) — proceeding without mlRiskScore.`);
      return null;
    }

    const data = await res.json();
    return {
      mlRiskScore: data.riskScore,
      mlRiskGrade: data.riskGrade,
      mlTopFactors: data.topFactors,
      mlModelVersion: data.modelVersion,
    };
  } catch (err) {
    console.warn(`ML risk prediction failed (${err.message}) — proceeding without mlRiskScore.`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { getMlRiskScore };
