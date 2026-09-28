/**
 * HedgeMind Corporate Treasury Risk - Risk Analysis Module Demo Data
 * This represents the "QUANTIFY RISK" analytical layer.
 * All metrics are simulated models intended for prototype evaluation.
 * STRICTLY ILLUSTRATIVE DEMO DATA.
 */

// Top 4 Compact Bento KPI Metrics
export const topRiskMetrics = {
  overallRisk: {
    title: "Overall Risk Score",
    score: 72,
    maxScore: 100,
    level: "HIGH",
    trend: "+4 pts vs baseline",
    status: "critical",
    subtext: "Above corporate risk appetite threshold (65/100)",
  },
  varMetric: {
    title: "Value at Risk (VaR)",
    value: "₹1.42 Cr",
    rawAmount: 14200000,
    confidence: "95% Confidence",
    horizon: "1-Day Horizon",
    status: "warning",
    subtext: "Parametric Normal distribution estimate",
  },
  expectedShortfall: {
    title: "Expected Shortfall (CVaR)",
    value: "₹1.87 Cr",
    rawAmount: 18700000,
    confidence: "95% Confidence",
    status: "critical",
    subtext: "Conditional average loss beyond VaR threshold",
  },
  portfolioVolatility: {
    title: "Portfolio Volatility",
    value: "18.6%",
    rawNumber: 18.6,
    annualized: "Annualized",
    trend: "+1.8% vs trailing 30D",
    status: "warning",
    subtext: "Implied mark-to-market variance across books",
  },
}

// VaR and Expected Shortfall parametric models across Confidence & Horizon
export const varMatrixData = {
  // Key format: `${confidence}_${horizon}`
  "90_1D": {
    varValue: "₹1.05 Cr",
    varRaw: 10500000,
    varPercent: "8.4%",
    esValue: "₹1.38 Cr",
    esRaw: 13800000,
    zScore: 1.28,
    tailProbability: "10.0%",
  },
  "95_1D": {
    varValue: "₹1.42 Cr",
    varRaw: 14200000,
    varPercent: "11.4%",
    esValue: "₹1.87 Cr",
    esRaw: 18700000,
    zScore: 1.645,
    tailProbability: "5.0%",
  },
  "99_1D": {
    varValue: "₹1.98 Cr",
    varRaw: 19800000,
    varPercent: "15.8%",
    esValue: "₹2.45 Cr",
    esRaw: 24500000,
    zScore: 2.326,
    tailProbability: "1.0%",
  },
  "90_5D": {
    varValue: "₹2.35 Cr",
    varRaw: 23500000,
    varPercent: "18.8%",
    esValue: "₹3.09 Cr",
    esRaw: 30900000,
    zScore: 1.28,
    tailProbability: "10.0%",
  },
  "95_5D": {
    varValue: "₹3.18 Cr",
    varRaw: 31800000,
    varPercent: "25.4%",
    esValue: "₹4.18 Cr",
    esRaw: 41800000,
    zScore: 1.645,
    tailProbability: "5.0%",
  },
  "99_5D": {
    varValue: "₹4.43 Cr",
    varRaw: 44300000,
    varPercent: "35.4%",
    esValue: "₹5.48 Cr",
    esRaw: 54800000,
    zScore: 2.326,
    tailProbability: "1.0%",
  },
  "90_10D": {
    varValue: "₹3.32 Cr",
    varRaw: 33200000,
    varPercent: "26.6%",
    esValue: "₹4.36 Cr",
    esRaw: 43600000,
    zScore: 1.28,
    tailProbability: "10.0%",
  },
  "95_10D": {
    varValue: "₹4.49 Cr",
    varRaw: 44900000,
    varPercent: "35.9%",
    esValue: "₹5.91 Cr",
    esRaw: 59100000,
    zScore: 1.645,
    tailProbability: "5.0%",
  },
  "99_10D": {
    varValue: "₹6.26 Cr",
    varRaw: 62600000,
    varPercent: "50.1%",
    esValue: "₹7.75 Cr",
    esRaw: 77500000,
    zScore: 2.326,
    tailProbability: "1.0%",
  },
}

/**
 * Generate Bell Curve points for loss distribution visualization.
 * X-axis represents simulated P&L outcomes (negative is loss in Cr).
 */
export function generateLossDistribution(confidence = "95", horizon = "1D") {
  const key = `${confidence}_${horizon}`
  const model = varMatrixData[key] || varMatrixData["95_1D"]
  const varInCr = model.varRaw / 10000000
  const esInCr = model.esRaw / 10000000

  // Points from -3.5 Cr to +2.5 Cr scaled by horizon multiplier
  const horizonMultiplier = horizon === "1D" ? 1 : horizon === "5D" ? 2.24 : 3.16
  const minRange = -3.5 * horizonMultiplier
  const maxRange = 2.5 * horizonMultiplier
  const step = (maxRange - minRange) / 50

  const points = []
  const mean = 0.2 * horizonMultiplier
  const stdDev = 0.86 * horizonMultiplier

  for (let x = minRange; x <= maxRange; x += step) {
    // Normal PDF: (1 / (σ * sqrt(2π))) * exp(-0.5 * ((x - μ)/σ)^2)
    const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2)
    const density = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent) * 100

    // Downside is when x is negative and loss is x <= -varInCr
    const isTailLoss = x <= -varInCr
    const isESLoss = x <= -esInCr

    points.push({
      pnl: parseFloat(x.toFixed(2)),
      density: parseFloat(density.toFixed(2)),
      // Base normal curve
      normalDensity: parseFloat(density.toFixed(2)),
      // Highlighted loss region below 0
      lossDensity: x <= 0 ? parseFloat(density.toFixed(2)) : 0,
      // Tail loss region beyond VaR
      tailDensity: isTailLoss ? parseFloat(density.toFixed(2)) : 0,
      // ES region beyond Expected Shortfall
      esDensity: isESLoss ? parseFloat(density.toFixed(2)) : 0,
    })
  }

  return {
    points,
    varThreshold: -varInCr,
    esThreshold: -esInCr,
    model,
  }
}

// Risk Decomposition Data
export const riskDecompositionData = {
  currentScore: 72,
  maxScore: 100,
  factors: [
    {
      id: "factor-volatility",
      name: "Market Volatility",
      contribution: 24,
      percentageOfScore: 33.3,
      level: "HIGH",
      color: "#ef4444",
      description: "Elevated 30-day realized & implied variance across USD/INR options.",
    },
    {
      id: "factor-fx-sensitivity",
      name: "FX Sensitivity",
      contribution: 21,
      percentageOfScore: 29.2,
      level: "HIGH",
      color: "#f97316",
      description: "Direct delta exposure to spot USD fluctuations on open payable contracts.",
    },
    {
      id: "factor-concentration",
      name: "Concentration",
      contribution: 14,
      percentageOfScore: 19.4,
      level: "MEDIUM",
      color: "#f59e0b",
      description: "Portfolio disproportionately concentrated in USD (64% single factor dependency).",
    },
    {
      id: "factor-timing",
      name: "Payment Timing",
      contribution: 8,
      percentageOfScore: 11.1,
      level: "LOW",
      color: "#3b82f6",
      description: "Settlement dates clustered within the upcoming 14-day liquidity cycle.",
    },
    {
      id: "factor-correlation",
      name: "Correlation",
      contribution: 5,
      percentageOfScore: 6.9,
      level: "LOW",
      color: "#8b5cf6",
      description: "Moderate co-movement between USD/INR and commodity input prices.",
    },
  ],
}

// Stress Testing Scenarios
export const stressTestingScenarios = [
  {
    id: "usd-plus-5",
    name: "USD/INR +5%",
    category: "FX Shock",
    baselineScore: 72,
    stressedScore: 86,
    riskLevel: "CRITICAL",
    additionalImpact: "₹82 L",
    additionalImpactRaw: 8200000,
    impactDirection: "negative",
    description: "Sudden INR depreciation against USD. Pushes payables to critical mark-to-market loss.",
    driverAffected: "USD Payables (ABC Components & Tech Supplies)",
  },
  {
    id: "usd-plus-10",
    name: "USD/INR +10%",
    category: "Extreme FX Shock",
    baselineScore: 72,
    stressedScore: 94,
    riskLevel: "CRITICAL",
    additionalImpact: "₹1.64 Cr",
    additionalImpactRaw: 16400000,
    impactDirection: "negative",
    description: "Severe currency stress test. Triggers covenant thresholds and margin requirements.",
    driverAffected: "All Foreign Currency Liabilities",
  },
  {
    id: "usd-minus-5",
    name: "USD/INR -5%",
    category: "Favorable FX Shift",
    baselineScore: 72,
    stressedScore: 58,
    riskLevel: "MODERATE",
    additionalImpact: "-₹82 L",
    additionalImpactRaw: -8200000,
    impactDirection: "positive",
    description: "INR appreciation lowers payable burden, reducing overall risk to safe zone.",
    driverAffected: "Net Import Book",
  },
  {
    id: "commodity-plus-10",
    name: "Commodity +10%",
    category: "Supply Chain",
    baselineScore: 72,
    stressedScore: 81,
    riskLevel: "HIGH",
    additionalImpact: "₹45 L",
    additionalImpactRaw: 4500000,
    impactDirection: "negative",
    description: "Surge in raw material input costs compounding unhedged metal import book.",
    driverAffected: "Global Metals procurement",
  },
  {
    id: "rates-plus-1",
    name: "Interest Rate +1%",
    category: "Monetary Shock",
    baselineScore: 72,
    stressedScore: 78,
    riskLevel: "HIGH",
    additionalImpact: "₹28 L",
    additionalImpactRaw: 2800000,
    impactDirection: "negative",
    description: "Higher central bank benchmark rates increase forward contract swap points and working capital carry.",
    driverAffected: "Short-term trade credit lines",
  },
  {
    id: "rates-minus-1",
    name: "Interest Rate -1%",
    category: "Monetary Easing",
    baselineScore: 72,
    stressedScore: 66,
    riskLevel: "MODERATE",
    additionalImpact: "-₹28 L",
    additionalImpactRaw: -2800000,
    impactDirection: "positive",
    description: "Benchmark rate cut lowers discounting costs on cross-border supply chain financing.",
    driverAffected: "Payable financing spreads",
  },
  {
    id: "payment-delay-15d",
    name: "Payment Delay +15 Days",
    category: "Liquidity / Timing",
    baselineScore: 72,
    stressedScore: 79,
    riskLevel: "HIGH",
    additionalImpact: "₹35 L",
    additionalImpactRaw: 3500000,
    impactDirection: "negative",
    description: "Operational delays extend exposure window into anticipated high-volatility election period.",
    driverAffected: "Unhedged invoice maturity rollover",
  },
  {
    id: "custom",
    name: "Custom Scenario",
    category: "Interactive Simulation",
    baselineScore: 72,
    stressedScore: 85,
    riskLevel: "HIGH",
    additionalImpact: "₹76 L",
    additionalImpactRaw: 7600000,
    impactDirection: "negative",
    description: "Configured stress parameters applied across multi-factor macroeconomic sensitivities.",
    driverAffected: "Composite Treasury Book",
  },
]

// Sensitivity Analysis Data (asymmetric downside vulnerability)
export const sensitivityAnalysisData = [
  {
    movement: "-10%",
    movementLabel: "-10% Spot",
    impact: "-₹1.64 Cr",
    rawImpact: -16400000,
    impactInCr: -1.64,
    type: "favorable",
    description: "Significant payable cost reduction from currency appreciation.",
    downsideRisk: 12,
  },
  {
    movement: "-5%",
    movementLabel: "-5% Spot",
    impact: "-₹82 L",
    rawImpact: -8200000,
    impactInCr: -0.82,
    type: "favorable",
    description: "Moderate favorable movement improving gross margin.",
    downsideRisk: 34,
  },
  {
    movement: "0%",
    movementLabel: "Baseline (0%)",
    impact: "₹0",
    rawImpact: 0,
    impactInCr: 0,
    type: "neutral",
    description: "Current mark-to-market valuation at prevailing spot rate.",
    downsideRisk: 72,
  },
  {
    movement: "+5%",
    movementLabel: "+5% Spot",
    impact: "+₹82 L",
    rawImpact: 8200000,
    impactInCr: 0.82,
    type: "adverse",
    description: "Adverse currency depreciation increasing rupee liabilities.",
    downsideRisk: 86,
  },
  {
    movement: "+10%",
    movementLabel: "+10% Spot",
    impact: "+₹1.64 Cr",
    rawImpact: 16400000,
    impactInCr: 1.64,
    type: "adverse",
    description: "Severe downside shock breaching secondary liquidity buffer.",
    downsideRisk: 94,
  },
]

// Risk Correlation Matrix (4x4 factor correlation heatmap)
export const riskCorrelationFactors = ["FX", "Commodity", "Interest Rate", "Payment Timing"]

export const riskCorrelationMatrix = [
  {
    factor: "FX",
    values: {
      FX: 1.0,
      Commodity: 0.42,
      "Interest Rate": 0.31,
      "Payment Timing": 0.18,
    },
  },
  {
    factor: "Commodity",
    values: {
      FX: 0.42,
      Commodity: 1.0,
      "Interest Rate": 0.27,
      "Payment Timing": 0.11,
    },
  },
  {
    factor: "Interest Rate",
    values: {
      FX: 0.31,
      Commodity: 0.27,
      "Interest Rate": 1.0,
      "Payment Timing": 0.24,
    },
  },
  {
    factor: "Payment Timing",
    values: {
      FX: 0.18,
      Commodity: 0.11,
      "Interest Rate": 0.24,
      "Payment Timing": 1.0,
    },
  },
]

// Top Risk Drivers
export const topRiskDrivers = [
  {
    rank: "01",
    name: "USD Sensitivity",
    riskLevel: "HIGH",
    contribution: "+21 risk points",
    points: 21,
    icon: "DollarSign",
    color: "#ef4444",
    badgeVariant: "destructive",
    explanation: "Primary contributor to current risk score. Net short INR/long USD payables have 0.82 delta unhedged.",
  },
  {
    rank: "02",
    name: "Market Volatility",
    riskLevel: "HIGH",
    contribution: "+24 risk points",
    points: 24,
    icon: "Activity",
    color: "#ef4444",
    badgeVariant: "destructive",
    explanation: "Elevated 30-day implied FX variance across emerging market currencies impacting hedge pricing.",
  },
  {
    rank: "03",
    name: "Concentration",
    riskLevel: "MEDIUM",
    contribution: "+14 risk points",
    points: 14,
    icon: "Layers",
    color: "#f59e0b",
    badgeVariant: "warning",
    explanation: "Single-currency exposure imbalance with 64% of gross liabilities concentrated in USD.",
  },
  {
    rank: "04",
    name: "Payment Timing",
    riskLevel: "LOW",
    contribution: "+8 risk points",
    points: 8,
    icon: "Clock",
    color: "#3b82f6",
    badgeVariant: "default",
    explanation: "Clustered invoice settlement calendar in near-term 14-day horizon creates liquidity vulnerability.",
  },
]

// Tail Risk Analysis (fat-tailed loss progression)
export const tailRiskData = [
  {
    tier: "NORMAL",
    label: "1σ Normal Distribution",
    probability: "68.2% Confidence",
    potentialLoss: "₹42 L",
    rawLoss: 4200000,
    lossInCr: 0.42,
    severity: "Normal",
    color: "#10b981",
    description: "Expected day-to-day fluctuations within standard operating bounds.",
    ratioMultiplier: "1.0x",
  },
  {
    tier: "ADVERSE",
    label: "2σ Stress Threshold",
    probability: "95% VaR Horizon",
    potentialLoss: "₹1.42 Cr",
    rawLoss: 14200000,
    lossInCr: 1.42,
    severity: "Adverse",
    color: "#f59e0b",
    description: "Statistically rare quarterly shock causing material downside pressure.",
    ratioMultiplier: "3.4x",
  },
  {
    tier: "EXTREME",
    label: "3σ+ Fat-Tail Event",
    probability: "99.5% Black Swan",
    potentialLoss: "₹2.31 Cr",
    rawLoss: 23100000,
    lossInCr: 2.31,
    severity: "Extreme",
    color: "#ef4444",
    description: "Severe geopolitical or sovereign shock producing disproportionate non-linear losses.",
    ratioMultiplier: "5.5x",
  },
]

// Risk Concentration Data
export const riskConcentrationData = {
  topDependencyName: "USD Dependency",
  topDependencyPercentage: 64,
  concentrationStatus: "ELEVATED",
  concentrationBadge: "warning",
  explanation: "A high proportion of portfolio sensitivity is linked to a single risk factor.",
  herfindahlIndex: 0.485, // High concentration (> 0.25)
  benchmarkLimit: 50,
  factors: [
    { name: "USD (US Dollar)", share: 64, color: "#3b82f6" },
    { name: "EUR (Euro)", share: 25, color: "#f59e0b" },
    { name: "GBP (British Pound)", share: 11, color: "#8b5cf6" },
  ],
}

// Risk Thresholds (internal treasury board policy limits)
export const riskThresholdsData = [
  {
    id: "thresh-var",
    name: "VaR Limit",
    currentUtilization: 91,
    currentValue: "₹1.42 Cr",
    limitValue: "₹1.56 Cr (Internal Cap)",
    status: "Near Limit",
    badgeVariant: "destructive",
    statusColor: "#ef4444",
    barColor: "bg-red-500",
    warningThreshold: 80,
    criticalThreshold: 90,
  },
  {
    id: "thresh-vol",
    name: "Volatility Limit",
    currentUtilization: 74,
    currentValue: "18.6%",
    limitValue: "25.0% (Annualized Cap)",
    status: "Normal",
    badgeVariant: "safe",
    statusColor: "#10b981",
    barColor: "bg-emerald-500",
    warningThreshold: 80,
    criticalThreshold: 90,
  },
  {
    id: "thresh-conc",
    name: "Concentration Limit",
    currentUtilization: 82,
    currentValue: "64.0%",
    limitValue: "50.0% (Single Currency Cap)",
    status: "Elevated",
    badgeVariant: "warning",
    statusColor: "#f59e0b",
    barColor: "bg-amber-500",
    warningThreshold: 80,
    criticalThreshold: 90,
  },
]

// Risk Assessment Summary (Copilot risk diagnosis & workflow)
export const riskAssessmentData = {
  overallRisk: "HIGH",
  overallScore: 72,
  primaryConcern: "Elevated FX sensitivity combined with high concentration.",
  keyObservation: "A 5% adverse market movement could materially increase estimated downside.",
  currentStatus: "VaR is approaching the configured risk threshold (91% limit utilized).",
  recommendedAction: "Review hedge coverage ratio for near-term USD payables before end of week.",
  scenariosRoute: "scenarios",
  hedgeAdvisorRoute: "hedge-advisor",
}
