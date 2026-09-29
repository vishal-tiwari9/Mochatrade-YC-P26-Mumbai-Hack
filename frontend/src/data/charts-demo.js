/**
 * HedgeMind - Charts & Analytics Centralized Mock Data
 * Corporate Treasury Risk and Financial Visualizations
 * NOTE: These are demo/illustrative metrics for prototype evaluation.
 */

export const analyticsSummaryData = {
  totalExposure: {
    title: "Total Exposure",
    value: "₹12.5 Cr",
    rawAmount: 125000000,
    change: "+8.4%",
    comparison: "vs previous period",
    trend: "up",
    iconName: "Wallet",
  },
  highestRisk: {
    title: "Highest Risk",
    category: "FX Risk",
    percentage: "62%",
    severity: "High",
    iconName: "ShieldAlert",
  },
  potentialImpact: {
    title: "Potential Impact",
    value: "₹2.14 Cr",
    subtitle: "Estimated 99% VaR",
    badge: "Illustrative Scenario",
    iconName: "CircleDollarSign",
  },
  hedgedExposure: {
    title: "Hedged Exposure",
    value: "68%",
    change: "+4.2%",
    comparison: "vs target coverage",
    trend: "up",
    iconName: "ShieldCheck",
  },
}

export const exposureTrendData = {
  "30d": [
    { date: "Aug 12", total: 9.2, usd: 6.0, eur: 2.2, gbp: 1.0 },
    { date: "Aug 17", total: 9.8, usd: 6.4, eur: 2.3, gbp: 1.1 },
    { date: "Aug 22", total: 10.4, usd: 6.9, eur: 2.4, gbp: 1.1 },
    { date: "Aug 27", total: 10.1, usd: 6.7, eur: 2.3, gbp: 1.1 },
    { date: "Sep 01", total: 11.2, usd: 7.4, eur: 2.6, gbp: 1.2 },
    { date: "Sep 06", total: 11.9, usd: 7.8, eur: 2.9, gbp: 1.2 },
    { date: "Sep 10", total: 12.5, usd: 8.2, eur: 3.1, gbp: 1.2 },
  ],
  "7d": [
    { date: "Sep 04", total: 11.5, usd: 7.5, eur: 2.8, gbp: 1.2 },
    { date: "Sep 05", total: 11.7, usd: 7.6, eur: 2.9, gbp: 1.2 },
    { date: "Sep 06", total: 11.9, usd: 7.8, eur: 2.9, gbp: 1.2 },
    { date: "Sep 07", total: 12.0, usd: 7.9, eur: 2.9, gbp: 1.2 },
    { date: "Sep 08", total: 12.2, usd: 8.0, eur: 3.0, gbp: 1.2 },
    { date: "Sep 09", total: 12.4, usd: 8.1, eur: 3.1, gbp: 1.2 },
    { date: "Sep 10", total: 12.5, usd: 8.2, eur: 3.1, gbp: 1.2 },
  ],
  "90d": [
    { date: "Jun 15", total: 7.8, usd: 5.1, eur: 1.9, gbp: 0.8 },
    { date: "Jul 01", total: 8.1, usd: 5.3, eur: 2.0, gbp: 0.8 },
    { date: "Jul 15", total: 8.5, usd: 5.5, eur: 2.1, gbp: 0.9 },
    { date: "Aug 01", total: 8.9, usd: 5.8, eur: 2.2, gbp: 0.9 },
    { date: "Aug 15", total: 9.5, usd: 6.2, eur: 2.3, gbp: 1.0 },
    { date: "Sep 01", total: 11.2, usd: 7.4, eur: 2.6, gbp: 1.2 },
    { date: "Sep 10", total: 12.5, usd: 8.2, eur: 3.1, gbp: 1.2 },
  ],
  "6m": [
    { date: "Apr 01", total: 7.2, usd: 4.7, eur: 1.8, gbp: 0.7 },
    { date: "May 01", total: 7.5, usd: 4.9, eur: 1.9, gbp: 0.7 },
    { date: "Jun 01", total: 7.9, usd: 5.2, eur: 1.9, gbp: 0.8 },
    { date: "Jul 01", total: 8.1, usd: 5.3, eur: 2.0, gbp: 0.8 },
    { date: "Aug 01", total: 8.9, usd: 5.8, eur: 2.2, gbp: 0.9 },
    { date: "Sep 01", total: 11.2, usd: 7.4, eur: 2.6, gbp: 1.2 },
    { date: "Sep 10", total: 12.5, usd: 8.2, eur: 3.1, gbp: 1.2 },
  ],
  "1y": [
    { date: "Q4 25", total: 6.4, usd: 4.1, eur: 1.6, gbp: 0.7 },
    { date: "Q1 26", total: 7.0, usd: 4.6, eur: 1.7, gbp: 0.7 },
    { date: "Q2 26", total: 8.0, usd: 5.2, eur: 2.0, gbp: 0.8 },
    { date: "Q3 26", total: 12.5, usd: 8.2, eur: 3.1, gbp: 1.2 },
  ],
}

export const riskBreakdownData = {
  overallRiskScore: 72,
  overallRiskLevel: "High Risk",
  categories: [
    { category: "FX Risk", percentage: 62, value: "₹7.75 Cr", color: "#3b82f6", level: "High" },
    { category: "Commodity Risk", percentage: 23, value: "₹2.88 Cr", color: "#f59e0b", level: "Medium" },
    { category: "Interest Rate Risk", percentage: 10, value: "₹1.25 Cr", color: "#10b981", level: "Low" },
    { category: "Payment Timing Risk", percentage: 5, value: "₹0.62 Cr", color: "#8b5cf6", level: "Low" },
  ],
}

export const currencyExposureData = [
  { currency: "USD", exposure: 8.2, risk: "High", change: 8.2, levelClass: "destructive" },
  { currency: "EUR", exposure: 3.1, risk: "Medium", change: 2.1, levelClass: "warning" },
  { currency: "GBP", exposure: 1.2, risk: "Low", change: -1.4, levelClass: "safe" },
  { currency: "JPY", exposure: 0.8, risk: "Low", change: 0.5, levelClass: "safe" },
  { currency: "CHF", exposure: 0.6, risk: "Low", change: -0.2, levelClass: "safe" },
  { currency: "SGD", exposure: 0.5, risk: "Low", change: 1.1, levelClass: "safe" },
  { currency: "AED", exposure: 0.4, risk: "Low", change: 0.0, levelClass: "safe" },
  { currency: "INR", exposure: 0.2, risk: "Low", change: -0.8, levelClass: "safe" },
]

export const marketImpactSensitivityData = [
  { movement: "-10%", impact: -1.85, label: "Favorable -10%" },
  { movement: "-5%", impact: -0.92, label: "Favorable -5%" },
  { movement: "0%", impact: 0.0, label: "Baseline" },
  { movement: "+5%", impact: 1.15, label: "Adverse +5%" },
  { movement: "+10%", impact: 2.14, label: "Severe Adverse +10%" },
]

export const hedgedVsUnhedgedData = [
  {
    currency: "USD",
    hedged: 68,
    unhedged: 32,
    hedgedVal: 5.58,
    unhedgedVal: 2.62,
    total: 8.2,
  },
  {
    currency: "EUR",
    hedged: 61,
    unhedged: 39,
    hedgedVal: 1.89,
    unhedgedVal: 1.21,
    total: 3.1,
  },
  {
    currency: "GBP",
    hedged: 74,
    unhedged: 26,
    hedgedVal: 0.89,
    unhedgedVal: 0.31,
    total: 1.2,
  },
  {
    currency: "JPY",
    hedged: 80,
    unhedged: 20,
    hedgedVal: 0.64,
    unhedgedVal: 0.16,
    total: 0.8,
  },
]

export const upcomingPaymentTimelineData = [
  { date: "12 Sep", amount: 3.74, supplier: "ABC Components", currency: "USD", status: "Unhedged" },
  { date: "15 Sep", amount: 1.62, supplier: "Global Metals", currency: "EUR", status: "Forward Locked" },
  { date: "18 Sep", amount: 1.83, supplier: "Tech Supplies", currency: "USD", status: "Option Protected" },
  { date: "22 Sep", amount: 0.95, supplier: "Euro Logistics", currency: "EUR", status: "Hedged" },
  { date: "28 Sep", amount: 1.40, supplier: "Nippon Semi", currency: "JPY", status: "Forward Locked" },
]

export const exposureSnapshotData = [
  { title: "Total Exposure", value: "₹12.5 Cr", share: "100%", ticker: "TOT_EXP" },
  { title: "FX Exposure", value: "₹8.2 Cr", share: "65.6%", ticker: "FX_NET" },
  { title: "Commodity Exposure", value: "₹2.9 Cr", share: "23.2%", ticker: "COMM_EXP" },
  { title: "Interest Rate", value: "₹1.4 Cr", share: "11.2%", ticker: "IR_FLOAT" },
]
