/**
 * HedgeMind Corporate Treasury Risk - Reports Demo Data
 * Pre-generated mock reports for the Report Center.
 * STRICTLY ILLUSTRATIVE DEMO DATA.
 */

export const recentReportsData = [
  {
    id: "RPT-001",
    name: "Monthly Risk Summary",
    type: "Executive",
    period: "Sep 2026",
    generatedAt: "2026-09-11",
    status: "Ready",
    format: "pdf",
    fileSize: "2.4 MB",
  },
  {
    id: "RPT-002",
    name: "FX Exposure Report",
    type: "Exposure",
    period: "Sep 2026",
    generatedAt: "2026-09-10",
    status: "Ready",
    format: "pdf",
    fileSize: "1.8 MB",
  },
  {
    id: "RPT-003",
    name: "USD Stress Test",
    type: "Scenario",
    period: "Sep 2026",
    generatedAt: "2026-09-08",
    status: "Ready",
    format: "pdf",
    fileSize: "1.2 MB",
  },
  {
    id: "RPT-004",
    name: "Portfolio Risk Review",
    type: "Risk Analysis",
    period: "Sep 2026",
    generatedAt: "2026-09-05",
    status: "Ready",
    format: "pdf",
    fileSize: "3.1 MB",
  },
  {
    id: "RPT-005",
    name: "Q3 Executive Summary",
    type: "Executive",
    period: "Aug 2026",
    generatedAt: "2026-08-31",
    status: "Ready",
    format: "pdf",
    fileSize: "2.8 MB",
  },
]

/**
 * Report content data - realistic structured financial content for previews.
 * Reuses values from dashboard-demo and risk-analysis-demo.
 */
export const reportContentData = {
  executive: {
    title: "Executive Risk Summary",
    sections: {
      portfolioOverview: {
        totalExposure: "₹12.5 Cr",
        riskScore: "72 / 100",
        riskLevel: "HIGH",
        var95: "₹1.42 Cr",
        expectedShortfall: "₹1.87 Cr",
        portfolioVolatility: "18.6%",
        activeCurrencies: 3,
        activeCounterparties: 8,
      },
      keyRiskDrivers: [
        { driver: "Market Volatility", level: "HIGH", contribution: "+24 pts" },
        { driver: "FX Sensitivity", level: "HIGH", contribution: "+21 pts" },
        { driver: "Concentration", level: "MEDIUM", contribution: "+14 pts" },
        { driver: "Payment Timing", level: "LOW", contribution: "+8 pts" },
      ],
      topExposures: [
        { counterparty: "ABC Components", currency: "USD", amount: "$450K", inrEquiv: "₹3.74 Cr" },
        { counterparty: "Tech Supplies", currency: "USD", amount: "$220K", inrEquiv: "₹1.83 Cr" },
        { counterparty: "Global Metals", currency: "EUR", amount: "€180K", inrEquiv: "₹1.62 Cr" },
      ],
      keyObservations: [
        "USD concentration at 65.6% exceeds the 50% single-currency policy limit.",
        "VaR at 91% of internal threshold — approaching risk appetite ceiling.",
        "A 5% adverse USD/INR movement would increase risk score to 86 (CRITICAL).",
        "Near-term payment cluster within 14 days creates concentrated liquidity demand.",
      ],
    },
  },
  exposure: {
    title: "Exposure Report",
    sections: {
      summary: {
        totalExposure: "₹12.5 Cr",
        currencyPairs: 3,
        counterparties: 8,
        averageMaturity: "22 days",
        hedgedPercentage: "42%",
        unhedgedExposure: "₹7.25 Cr",
      },
      currencyBreakdown: [
        { currency: "USD", pair: "USD/INR", exposure: "₹8.2 Cr", share: "65.6%", risk: "High", hedged: "35%" },
        { currency: "EUR", pair: "EUR/INR", exposure: "₹3.1 Cr", share: "24.8%", risk: "Medium", hedged: "50%" },
        { currency: "GBP", pair: "GBP/INR", exposure: "₹1.2 Cr", share: "9.6%", risk: "Low", hedged: "75%" },
      ],
      topCounterparties: [
        { name: "ABC Components", currency: "USD", amount: "$450K", maturity: "12 Sep", status: "Unhedged" },
        { name: "Tech Supplies", currency: "USD", amount: "$220K", maturity: "18 Sep", status: "Option Protected" },
        { name: "Global Metals", currency: "EUR", amount: "€180K", maturity: "15 Sep", status: "Partial Hedge" },
        { name: "Nordic Parts", currency: "GBP", amount: "£95K", maturity: "22 Sep", status: "Forward Locked" },
      ],
      concentrationAnalysis: {
        herfindahlIndex: 0.485,
        dominantCurrency: "USD (65.6%)",
        policyLimit: "50%",
        status: "ELEVATED — exceeds single-currency policy limit",
      },
    },
  },
  riskAnalysis: {
    title: "Risk Analysis Report",
    sections: {
      overview: {
        overallRiskScore: "72 / 100",
        riskLevel: "HIGH",
        var95_1D: "₹1.42 Cr",
        var99_1D: "₹1.98 Cr",
        expectedShortfall: "₹1.87 Cr",
        portfolioVolatility: "18.6%",
        varUtilization: "91%",
      },
      stressTestSummary: [
        { scenario: "USD/INR +5%", stressedScore: 86, impact: "₹82 L", level: "CRITICAL" },
        { scenario: "USD/INR +10%", stressedScore: 94, impact: "₹1.64 Cr", level: "CRITICAL" },
        { scenario: "Commodity +10%", stressedScore: 81, impact: "₹45 L", level: "HIGH" },
        { scenario: "Interest Rate +1%", stressedScore: 78, impact: "₹28 L", level: "HIGH" },
      ],
      riskDecomposition: [
        { factor: "Market Volatility", contribution: 24, share: "33.3%", level: "HIGH" },
        { factor: "FX Sensitivity", contribution: 21, share: "29.2%", level: "HIGH" },
        { factor: "Concentration", contribution: 14, share: "19.4%", level: "MEDIUM" },
        { factor: "Payment Timing", contribution: 8, share: "11.1%", level: "LOW" },
        { factor: "Correlation", contribution: 5, share: "6.9%", level: "LOW" },
      ],
      thresholds: [
        { metric: "VaR Limit", utilization: "91%", current: "₹1.42 Cr", limit: "₹1.56 Cr", status: "Near Limit" },
        { metric: "Volatility Limit", utilization: "74%", current: "18.6%", limit: "25.0%", status: "Normal" },
        { metric: "Concentration Limit", utilization: "82%", current: "64.0%", limit: "50.0%", status: "Elevated" },
      ],
    },
  },
  scenario: {
    title: "Scenario Report",
    sections: {
      scenarios: [
        {
          name: "USD/INR +5%",
          category: "FX Shock",
          baseScore: 72,
          stressedScore: 86,
          riskLevel: "CRITICAL",
          impact: "₹82 L",
          affectedExposures: "USD Payables (ABC Components & Tech Supplies)",
          conclusion: "Severe risk escalation — triggers immediate hedge review requirement.",
        },
        {
          name: "USD/INR +10%",
          category: "Extreme FX Shock",
          baseScore: 72,
          stressedScore: 94,
          riskLevel: "CRITICAL",
          impact: "₹1.64 Cr",
          affectedExposures: "All Foreign Currency Liabilities",
          conclusion: "Triggers covenant thresholds and margin requirements across all books.",
        },
        {
          name: "Commodity +10%",
          category: "Supply Chain",
          baseScore: 72,
          stressedScore: 81,
          riskLevel: "HIGH",
          impact: "₹45 L",
          affectedExposures: "Global Metals procurement",
          conclusion: "Material cost uplift compounds existing unhedged metal import exposure.",
        },
        {
          name: "Interest Rate +1%",
          category: "Monetary Shock",
          baseScore: 72,
          stressedScore: 78,
          riskLevel: "HIGH",
          impact: "₹28 L",
          affectedExposures: "Short-term trade credit lines",
          conclusion: "Marginal increase in forward swap points and working capital cost.",
        },
      ],
      overallAssessment: "The portfolio is most vulnerable to adverse USD/INR movements. A 5% depreciation alone would push the risk score from HIGH to CRITICAL. Commodity and interest rate shocks produce moderate but manageable additional stress.",
    },
  },
}

/**
 * Report type definitions for the Bento cards
 */
export const reportTypeDefinitions = [
  {
    id: "executive",
    title: "Executive Risk Summary",
    description: "Management-level risk overview with key metrics, drivers, and portfolio observations.",
    icon: "ShieldCheck",
    tag: "Strategic",
    tagColor: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "exposure",
    title: "Exposure Report",
    description: "Currency, counterparty, and maturity exposure breakdown with concentration analysis.",
    icon: "Wallet",
    tag: "Operational",
    tagColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "risk-analysis",
    title: "Risk Analysis Report",
    description: "VaR, Expected Shortfall, volatility, risk decomposition, and threshold monitoring.",
    icon: "Activity",
    tag: "Quantitative",
    tagColor: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: "scenario",
    title: "Scenario Report",
    description: "Stress-test assumptions, market movements, and estimated financial impact analysis.",
    icon: "FlaskConical",
    tag: "Simulation",
    tagColor: "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
]
