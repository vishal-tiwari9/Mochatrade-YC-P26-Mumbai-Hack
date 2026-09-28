/**
 * HedgeMind Corporate Treasury Risk - Mock Data
 * This represents the "SEE" layer of financial exposure.
 * NOTE: These are mock demo metrics for hackathon evaluation.
 */

export const dashboardData = {
  // Key Performance Indicators (Row 1)
  kpis: {
    overallRisk: {
      score: 72,
      maxScore: 100,
      level: "HIGH",
      change: "+8.4%",
      period: "from last month",
      status: "critical",
    },
    totalExposure: {
      value: "₹12.5 Cr",
      rawAmount: 125000000,
      currencyBreakdown: "Across 3 currencies",
      status: "neutral",
    },
    potentialImpact: {
      value: "₹2.14 Cr",
      rawAmount: 21400000,
      description: "Estimated impact under adverse market movement",
      stressScenario: "99% VaR (30-day horizon)",
      status: "warning",
    },
    activeAlerts: {
      total: 7,
      critical: 2,
      medium: 5,
      description: "2 Critical, 5 Medium",
      status: "critical",
    },
  },

  // Exposure Trend Chart Data (Row 2 - Large)
  exposureTrend: {
    "30D": [
      { date: "Aug 12", exposure: 9.2, formatted: "₹9.2 Cr", usdPart: 6.0, eurPart: 2.2, gbpPart: 1.0 },
      { date: "Aug 17", exposure: 9.8, formatted: "₹9.8 Cr", usdPart: 6.4, eurPart: 2.3, gbpPart: 1.1 },
      { date: "Aug 22", exposure: 10.4, formatted: "₹10.4 Cr", usdPart: 6.9, eurPart: 2.4, gbpPart: 1.1 },
      { date: "Aug 27", exposure: 10.1, formatted: "₹10.1 Cr", usdPart: 6.7, eurPart: 2.3, gbpPart: 1.1 },
      { date: "Sep 01", exposure: 11.2, formatted: "₹11.2 Cr", usdPart: 7.4, eurPart: 2.6, gbpPart: 1.2 },
      { date: "Sep 06", exposure: 11.9, formatted: "₹11.9 Cr", usdPart: 7.8, eurPart: 2.9, gbpPart: 1.2 },
      { date: "Sep 10", exposure: 12.5, formatted: "₹12.5 Cr", usdPart: 8.2, eurPart: 3.1, gbpPart: 1.2 },
    ],
    "7D": [
      { date: "Sep 04", exposure: 11.5, formatted: "₹11.5 Cr", usdPart: 7.5, eurPart: 2.8, gbpPart: 1.2 },
      { date: "Sep 05", exposure: 11.7, formatted: "₹11.7 Cr", usdPart: 7.6, eurPart: 2.9, gbpPart: 1.2 },
      { date: "Sep 06", exposure: 11.9, formatted: "₹11.9 Cr", usdPart: 7.8, eurPart: 2.9, gbpPart: 1.2 },
      { date: "Sep 07", exposure: 12.0, formatted: "₹12.0 Cr", usdPart: 7.9, eurPart: 2.9, gbpPart: 1.2 },
      { date: "Sep 08", exposure: 12.2, formatted: "₹12.2 Cr", usdPart: 8.0, eurPart: 3.0, gbpPart: 1.2 },
      { date: "Sep 09", exposure: 12.4, formatted: "₹12.4 Cr", usdPart: 8.1, eurPart: 3.1, gbpPart: 1.2 },
      { date: "Sep 10", exposure: 12.5, formatted: "₹12.5 Cr", usdPart: 8.2, eurPart: 3.1, gbpPart: 1.2 },
    ],
    "90D": [
      { date: "Jun 15", exposure: 7.8, formatted: "₹7.8 Cr", usdPart: 5.1, eurPart: 1.9, gbpPart: 0.8 },
      { date: "Jul 01", exposure: 8.1, formatted: "₹8.1 Cr", usdPart: 5.3, eurPart: 2.0, gbpPart: 0.8 },
      { date: "Jul 15", exposure: 8.5, formatted: "₹8.5 Cr", usdPart: 5.5, eurPart: 2.1, gbpPart: 0.9 },
      { date: "Aug 01", exposure: 8.9, formatted: "₹8.9 Cr", usdPart: 5.8, eurPart: 2.2, gbpPart: 0.9 },
      { date: "Aug 15", exposure: 9.5, formatted: "₹9.5 Cr", usdPart: 6.2, eurPart: 2.3, gbpPart: 1.0 },
      { date: "Sep 01", exposure: 11.2, formatted: "₹11.2 Cr", usdPart: 7.4, eurPart: 2.6, gbpPart: 1.2 },
      { date: "Sep 10", exposure: 12.5, formatted: "₹12.5 Cr", usdPart: 8.2, eurPart: 3.1, gbpPart: 1.2 },
    ],
  },

  // Risk Breakdown (Row 2 - Medium)
  riskBreakdown: [
    {
      category: "FX Risk",
      percentage: 62,
      amount: "₹7.75 Cr",
      color: "#3b82f6", // Luminous Blue
      description: "Foreign currency volatility (USD, EUR, GBP)",
    },
    {
      category: "Commodity Risk",
      percentage: 23,
      amount: "₹2.88 Cr",
      color: "#f59e0b", // Amber
      description: "Raw material & energy index fluctuations",
    },
    {
      category: "Interest Rate Risk",
      percentage: 15,
      amount: "₹1.87 Cr",
      color: "#8b5cf6", // Violet / Purple
      description: "Floating benchmark adjustments (SOFR, MIBOR)",
    },
  ],

  // Currency Exposure Table (Row 3 - Left)
  currencyExposure: [
    {
      id: "curr-usd",
      currency: "USD",
      pair: "USD/INR",
      exposure: "₹8.2 Cr",
      percentageOfTotal: 65.6,
      risk: "High",
      riskBadgeVariant: "destructive",
      change: "+8.2%",
      direction: "up",
      hedgedPercent: "35%",
    },
    {
      id: "curr-eur",
      currency: "EUR",
      pair: "EUR/INR",
      exposure: "₹3.1 Cr",
      percentageOfTotal: 24.8,
      risk: "Medium",
      riskBadgeVariant: "warning",
      change: "+2.1%",
      direction: "up",
      hedgedPercent: "50%",
    },
    {
      id: "curr-gbp",
      currency: "GBP",
      pair: "GBP/INR",
      exposure: "₹1.2 Cr",
      percentageOfTotal: 9.6,
      risk: "Low",
      riskBadgeVariant: "safe",
      change: "-1.4%",
      direction: "down",
      hedgedPercent: "75%",
    },
  ],

  // Recent Alerts (Row 3 - Right)
  recentAlerts: [
    {
      id: "alt-1",
      severity: "Critical",
      title: "USD exposure increased by 8%",
      details: "Exceeded corporate risk threshold for Q3 supplier payables.",
      timestamp: "12 minutes ago",
      iconType: "AlertCircle",
      status: "critical",
    },
    {
      id: "alt-2",
      severity: "Warning",
      title: "Supplier payment delayed",
      details: "ABC Components invoice #INV-4901 shifted payment window by 14 days.",
      timestamp: "1 hour ago",
      iconType: "TriangleAlert",
      status: "warning",
    },
    {
      id: "alt-3",
      severity: "Warning",
      title: "Commodity exposure crossed threshold",
      details: "Aluminium raw material hedge coverage fell below 40%.",
      timestamp: "3 hours ago",
      iconType: "TriangleAlert",
      status: "warning",
    },
    {
      id: "alt-4",
      severity: "Info",
      title: "EUR exposure decreased by 3%",
      details: "European receivables settled ahead of scheduled due date.",
      timestamp: "5 hours ago",
      iconType: "Info",
      status: "info",
    },
  ],

  // Upcoming Payments (Row 4)
  upcomingPayments: [
    {
      id: "pmt-1",
      supplier: "ABC Components",
      currency: "USD",
      amount: "$450K",
      inrEquivalent: "₹3.74 Cr",
      dueDate: "12 Sep",
      status: "Pending Review",
      hedgeStatus: "Unhedged",
    },
    {
      id: "pmt-2",
      supplier: "Global Metals",
      currency: "EUR",
      amount: "€180K",
      inrEquivalent: "₹1.62 Cr",
      dueDate: "15 Sep",
      status: "Forward Locked",
      hedgeStatus: "Partially Hedged",
    },
    {
      id: "pmt-3",
      supplier: "Tech Supplies",
      currency: "USD",
      amount: "$220K",
      inrEquivalent: "₹1.83 Cr",
      dueDate: "18 Sep",
      status: "Approved",
      hedgeStatus: "Option Protected",
    },
  ],
}
