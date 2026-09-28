/**
 * HedgeMind Corporate Treasury Risk - Report Service
 * Handles report generation, preview, and download.
 * Mock implementation — designed for seamless backend replacement.
 *
 * Future backend contract:
 *   POST /api/reports/generate
 *   GET  /api/reports/:id
 *   GET  /api/reports/:id/download
 *
 * STRICTLY NO CLIENT-SIDE FINANCIAL CALCULATIONS.
 */

import { recentReportsData, reportContentData } from "@/data/reports-demo"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

let _localReports = [...recentReportsData]
let _nextId = 6

/**
 * Get all reports (mock)
 */
export async function getReports() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`)
    if (response.ok) {
      return await response.json()
    }
  } catch {
    // Backend unavailable — use mock data
  }
  return [..._localReports]
}

/**
 * Generate a report (mock)
 * @param {Object} config - Report configuration
 * @param {string} config.reportType - executive | exposure | risk-analysis | scenario
 * @param {string} config.period - 7d | 30d | 90d | 1y
 * @param {string} config.currency - all | usd | eur | gbp
 * @param {string} config.riskLevel - all | high | medium | low
 * @param {string[]} config.sections - Selected sections
 * @param {string} config.format - pdf | csv
 */
export async function generateReport(config) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report_type: config.reportType,
        period: config.period,
        currency: config.currency,
        risk_level: config.riskLevel,
        sections: config.sections,
        format: config.format,
      }),
    })
    if (response.ok) {
      return await response.json()
    }
  } catch {
    // Backend unavailable — use mock generation
  }

  // Mock: simulate generation delay
  await new Promise((resolve) => setTimeout(resolve, 1800))

  const typeNames = {
    executive: "Executive",
    exposure: "Exposure",
    "risk-analysis": "Risk Analysis",
    scenario: "Scenario",
  }

  const periodNames = {
    "7d": "7 Days",
    "30d": "30 Days",
    "90d": "90 Days",
    "1y": "1 Year",
  }

  const reportName = _getReportName(config.reportType, config.period)
  const id = `RPT-${String(_nextId++).padStart(3, "0")}`
  const now = new Date()

  const newReport = {
    id,
    name: reportName,
    type: typeNames[config.reportType] || "Executive",
    period: now.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    generatedAt: now.toISOString().split("T")[0],
    status: "Ready",
    format: config.format || "pdf",
    fileSize: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
  }

  _localReports = [newReport, ..._localReports]
  return newReport
}

/**
 * Get report preview content (mock)
 */
export function getReportPreviewContent(reportType) {
  const typeMap = {
    Executive: "executive",
    Exposure: "exposure",
    "Risk Analysis": "riskAnalysis",
    Scenario: "scenario",
  }
  const key = typeMap[reportType] || "executive"
  return reportContentData[key] || reportContentData.executive
}

/**
 * Download a report as a text/HTML file.
 * Generates structured financial report content in the browser.
 */
export function downloadReport(report) {
  const content = getReportPreviewContent(report.type)
  const html = _buildReportHTML(content, report)
  const blob = new Blob([html], { type: "text/html;charset=utf-8" })

  const filename = _sanitizeFilename(
    `HedgeMind_${report.name.replace(/\s+/g, "_")}_${report.period.replace(/\s+/g, "_")}.html`
  )

  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function _getReportName(type, period) {
  const names = {
    executive: "Executive Risk Summary",
    exposure: "FX Exposure Report",
    "risk-analysis": "Portfolio Risk Review",
    scenario: "Stress Test Report",
  }
  const periodLabel = { "7d": "Weekly", "30d": "Monthly", "90d": "Quarterly", "1y": "Annual" }
  return `${periodLabel[period] || "Monthly"} ${names[type] || "Risk Summary"}`
}

function _sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_.\-]/g, "_")
}

function _buildReportHTML(content, report) {
  const now = new Date()
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  let body = ""

  if (content.sections?.portfolioOverview) {
    const po = content.sections.portfolioOverview
    body += `
      <h2>Portfolio Overview</h2>
      <table>
        <tr><td>Total Exposure</td><td><strong>${po.totalExposure}</strong></td></tr>
        <tr><td>Risk Score</td><td><strong>${po.riskScore}</strong></td></tr>
        <tr><td>Risk Level</td><td><strong>${po.riskLevel}</strong></td></tr>
        <tr><td>Value at Risk (95%)</td><td><strong>${po.var95}</strong></td></tr>
        <tr><td>Expected Shortfall</td><td><strong>${po.expectedShortfall}</strong></td></tr>
        <tr><td>Portfolio Volatility</td><td><strong>${po.portfolioVolatility}</strong></td></tr>
      </table>
    `
  }

  if (content.sections?.summary) {
    const s = content.sections.summary
    body += `
      <h2>Exposure Summary</h2>
      <table>
        <tr><td>Total Exposure</td><td><strong>${s.totalExposure}</strong></td></tr>
        <tr><td>Currency Pairs</td><td><strong>${s.currencyPairs}</strong></td></tr>
        <tr><td>Counterparties</td><td><strong>${s.counterparties}</strong></td></tr>
        <tr><td>Average Maturity</td><td><strong>${s.averageMaturity}</strong></td></tr>
        <tr><td>Hedged Percentage</td><td><strong>${s.hedgedPercentage}</strong></td></tr>
        <tr><td>Unhedged Exposure</td><td><strong>${s.unhedgedExposure}</strong></td></tr>
      </table>
    `
  }

  if (content.sections?.overview) {
    const o = content.sections.overview
    body += `
      <h2>Risk Overview</h2>
      <table>
        <tr><td>Overall Risk Score</td><td><strong>${o.overallRiskScore}</strong></td></tr>
        <tr><td>Risk Level</td><td><strong>${o.riskLevel}</strong></td></tr>
        <tr><td>VaR (95%, 1-Day)</td><td><strong>${o.var95_1D}</strong></td></tr>
        <tr><td>VaR (99%, 1-Day)</td><td><strong>${o.var99_1D}</strong></td></tr>
        <tr><td>Expected Shortfall</td><td><strong>${o.expectedShortfall}</strong></td></tr>
        <tr><td>Portfolio Volatility</td><td><strong>${o.portfolioVolatility}</strong></td></tr>
        <tr><td>VaR Utilization</td><td><strong>${o.varUtilization}</strong></td></tr>
      </table>
    `
  }

  if (content.sections?.keyRiskDrivers) {
    body += `
      <h2>Key Risk Drivers</h2>
      <table>
        <thead><tr><th>Driver</th><th>Level</th><th>Contribution</th></tr></thead>
        <tbody>
          ${content.sections.keyRiskDrivers
            .map((d) => `<tr><td>${d.driver}</td><td>${d.level}</td><td>${d.contribution}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    `
  }

  if (content.sections?.riskDecomposition) {
    body += `
      <h2>Risk Decomposition</h2>
      <table>
        <thead><tr><th>Factor</th><th>Contribution</th><th>Share</th><th>Level</th></tr></thead>
        <tbody>
          ${content.sections.riskDecomposition
            .map((d) => `<tr><td>${d.factor}</td><td>${d.contribution}</td><td>${d.share}</td><td>${d.level}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    `
  }

  if (content.sections?.currencyBreakdown) {
    body += `
      <h2>Currency Breakdown</h2>
      <table>
        <thead><tr><th>Currency</th><th>Pair</th><th>Exposure</th><th>Share</th><th>Risk</th><th>Hedged</th></tr></thead>
        <tbody>
          ${content.sections.currencyBreakdown
            .map((c) => `<tr><td>${c.currency}</td><td>${c.pair}</td><td>${c.exposure}</td><td>${c.share}</td><td>${c.risk}</td><td>${c.hedged}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    `
  }

  if (content.sections?.topExposures) {
    body += `
      <h2>Top Exposures</h2>
      <table>
        <thead><tr><th>Counterparty</th><th>Currency</th><th>Amount</th><th>INR Equivalent</th></tr></thead>
        <tbody>
          ${content.sections.topExposures
            .map((e) => `<tr><td>${e.counterparty}</td><td>${e.currency}</td><td>${e.amount}</td><td>${e.inrEquiv}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    `
  }

  if (content.sections?.topCounterparties) {
    body += `
      <h2>Top Counterparties</h2>
      <table>
        <thead><tr><th>Name</th><th>Currency</th><th>Amount</th><th>Maturity</th><th>Status</th></tr></thead>
        <tbody>
          ${content.sections.topCounterparties
            .map((c) => `<tr><td>${c.name}</td><td>${c.currency}</td><td>${c.amount}</td><td>${c.maturity}</td><td>${c.status}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    `
  }

  if (content.sections?.stressTestSummary) {
    body += `
      <h2>Stress Test Summary</h2>
      <table>
        <thead><tr><th>Scenario</th><th>Stressed Score</th><th>Impact</th><th>Level</th></tr></thead>
        <tbody>
          ${content.sections.stressTestSummary
            .map((s) => `<tr><td>${s.scenario}</td><td>${s.stressedScore}</td><td>${s.impact}</td><td>${s.level}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    `
  }

  if (content.sections?.scenarios) {
    body += `
      <h2>Scenario Analysis</h2>
      ${content.sections.scenarios.map((s) => `
        <h3>${s.name} — ${s.category}</h3>
        <table>
          <tr><td>Base Score</td><td>${s.baseScore}</td></tr>
          <tr><td>Stressed Score</td><td>${s.stressedScore}</td></tr>
          <tr><td>Risk Level</td><td>${s.riskLevel}</td></tr>
          <tr><td>Financial Impact</td><td><strong>${s.impact}</strong></td></tr>
          <tr><td>Affected Exposures</td><td>${s.affectedExposures}</td></tr>
        </table>
        <p><em>${s.conclusion}</em></p>
      `).join("")}
    `
  }

  if (content.sections?.thresholds) {
    body += `
      <h2>Risk Thresholds</h2>
      <table>
        <thead><tr><th>Metric</th><th>Utilization</th><th>Current</th><th>Limit</th><th>Status</th></tr></thead>
        <tbody>
          ${content.sections.thresholds
            .map((t) => `<tr><td>${t.metric}</td><td>${t.utilization}</td><td>${t.current}</td><td>${t.limit}</td><td>${t.status}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    `
  }

  if (content.sections?.keyObservations) {
    body += `
      <h2>Key Observations</h2>
      <ul>
        ${content.sections.keyObservations.map((obs) => `<li>${obs}</li>`).join("")}
      </ul>
    `
  }

  if (content.sections?.overallAssessment) {
    body += `
      <h2>Overall Assessment</h2>
      <p>${content.sections.overallAssessment}</p>
    `
  }

  if (content.sections?.concentrationAnalysis) {
    const ca = content.sections.concentrationAnalysis
    body += `
      <h2>Concentration Analysis</h2>
      <table>
        <tr><td>Herfindahl Index</td><td>${ca.herfindahlIndex}</td></tr>
        <tr><td>Dominant Currency</td><td>${ca.dominantCurrency}</td></tr>
        <tr><td>Policy Limit</td><td>${ca.policyLimit}</td></tr>
        <tr><td>Status</td><td>${ca.status}</td></tr>
      </table>
    `
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${content.title} — HedgeMind</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 24px; color: #1e293b; background: #fff; line-height: 1.6; }
    h1 { font-size: 24px; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 12px; }
    h2 { font-size: 17px; color: #1e40af; margin-top: 28px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    h3 { font-size: 15px; color: #334155; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    tr:nth-child(even) { background: #f8fafc; }
    ul { padding-left: 20px; }
    li { margin-bottom: 6px; font-size: 14px; }
    em { color: #64748b; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .header-left { }
    .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
    .logo { font-size: 20px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
    .disclaimer { margin-top: 40px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; color: #64748b; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <div class="logo">HedgeMind</div>
      <div class="meta">Corporate Treasury Risk Platform</div>
    </div>
    <div style="text-align: right">
      <div class="meta">Report ID: ${report.id}</div>
      <div class="meta">Generated: ${dateStr}</div>
    </div>
  </div>
  <h1>${content.title}</h1>
  <p class="meta">Reporting Period: ${report.period} &nbsp;|&nbsp; Format: ${report.format?.toUpperCase() || "PDF"}</p>
  ${body}
  <div class="disclaimer">
    <strong>Disclaimer:</strong> All exposure figures, Value at Risk projections, and scenario analyses shown in this report are simulated models intended for prototype evaluation. This report does not constitute financial advice.
  </div>
</body>
</html>`
}
