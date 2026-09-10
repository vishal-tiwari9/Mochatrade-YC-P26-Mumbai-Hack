// ── Emerging Fraud Networks (watchlist) ─────────────────────────────────

export const emergingNetworks = [
  {
    networkId: "NET-2291",
    label: "Delhi NCR Mule Cluster",
    history: [
      { date: "2026-08-20", accounts: 2, upiIds: 1, devices: 1 },
      { date: "2026-08-25", accounts: 3, upiIds: 2, devices: 1 },
      { date: "2026-09-01", accounts: 5, upiIds: 3, devices: 2 },
      { date: "2026-09-04", accounts: 7, upiIds: 4, devices: 2 },
      { date: "2026-09-07", accounts: 12, upiIds: 8, devices: 3 },
      { date: "2026-09-10", accounts: 17, upiIds: 11, devices: 5 },
    ],
    growthRatePct: 41,
    riskLevel: "CRITICAL",
    lastActivity: "2026-09-10T09:14:00",
    warning: "Potential fraud network is rapidly expanding across multiple states.",
  },
  {
    networkId: "NET-3087",
    label: "Bengaluru P2P Ring",
    history: [
      { date: "2026-08-22", accounts: 1, upiIds: 1, devices: 1 },
      { date: "2026-08-28", accounts: 3, upiIds: 2, devices: 1 },
      { date: "2026-09-03", accounts: 5, upiIds: 4, devices: 2 },
      { date: "2026-09-08", accounts: 9, upiIds: 7, devices: 3 },
      { date: "2026-09-10", accounts: 14, upiIds: 10, devices: 4 },
    ],
    growthRatePct: 55,
    riskLevel: "CRITICAL",
    lastActivity: "2026-09-10T11:42:00",
    warning: "High-velocity expansion detected — shared devices across two cities.",
  },
  {
    networkId: "NET-1456",
    label: "Hyderabad Micro-Loan Fraud",
    history: [
      { date: "2026-08-15", accounts: 2, upiIds: 2, devices: 1 },
      { date: "2026-08-25", accounts: 4, upiIds: 3, devices: 2 },
      { date: "2026-09-01", accounts: 5, upiIds: 4, devices: 2 },
      { date: "2026-09-06", accounts: 7, upiIds: 5, devices: 3 },
      { date: "2026-09-10", accounts: 8, upiIds: 6, devices: 3 },
    ],
    growthRatePct: 14,
    riskLevel: "HIGH",
    lastActivity: "2026-09-09T16:30:00",
    warning: "Moderate growth — linked to micro-loan disbursal fraud pattern.",
  },
  {
    networkId: "NET-4120",
    label: "Kolkata SIM-Swap Cluster",
    history: [
      { date: "2026-08-30", accounts: 2, upiIds: 1, devices: 1 },
      { date: "2026-09-03", accounts: 3, upiIds: 2, devices: 2 },
      { date: "2026-09-07", accounts: 4, upiIds: 3, devices: 2 },
      { date: "2026-09-10", accounts: 5, upiIds: 4, devices: 3 },
    ],
    growthRatePct: 25,
    riskLevel: "MEDIUM",
    lastActivity: "2026-09-09T08:55:00",
    warning: "Steady growth — SIM-swap indicators present on 3 devices.",
  },
  {
    networkId: "NET-5501",
    label: "Pune Investment Scam Cell",
    history: [
      { date: "2026-09-01", accounts: 1, upiIds: 1, devices: 1 },
      { date: "2026-09-05", accounts: 2, upiIds: 2, devices: 1 },
      { date: "2026-09-08", accounts: 3, upiIds: 2, devices: 1 },
      { date: "2026-09-10", accounts: 3, upiIds: 3, devices: 2 },
    ],
    growthRatePct: 0,
    riskLevel: "LOW",
    lastActivity: "2026-09-08T20:15:00",
    warning: "Minimal growth — monitoring for dormant reactivation.",
  },
];

export const GROWTH_THRESHOLD_PCT = 30;

// ── Evidence Pack / Fraud Response Mock ─────────────────────────────────

export const investigationData = {
  caseId: "CASE-2026-0912",
  transaction: {
    id: "TXN-88213",
    amount: 45000,
    currency: "INR",
    datetime: "2026-09-08T14:22:00",
    type: "UPI Transfer",
    status: "Completed",
  },
  victim: {
    name: "Rajesh Kumar",
    accountId: "ACC-7821",
    upiId: "rajesh.k@oksbi",
  },
  riskScore: 94,
  riskReasons: [
    "Shared device with known fraud account",
    "Common UPI beneficiary across 3 complaints",
    "Previous fraud connection (NET-2291)",
    "Rapid fund layering within 12 hours",
  ],
  connectedEntities: {
    accounts: ["ACC-1029", "ACC-4471", "ACC-6632"],
    upiIds: ["victim@upi", "scammer01@upi", "mule.acc@upi"],
    devices: ["DEV-9981", "DEV-7743"],
    phones: ["+91-98765XXXXX", "+91-87654XXXXX"],
  },
  moneyFlow: [
    { from: "Victim (Rajesh)", to: "Account A (ACC-1029)", amount: 45000 },
    { from: "Account A", to: "Account B (ACC-4471)", amount: 40000 },
    { from: "Account B", to: "Account C (ACC-6632)", amount: 35000 },
    { from: "Account C", to: "Crypto Wallet", amount: 34500 },
  ],
  investigationSummary:
    "Victim was contacted via WhatsApp by an individual posing as a bank representative. The victim was persuaded to make a UPI transfer of ₹45,000. Funds were rapidly layered through three mule accounts within 12 hours and partially converted to cryptocurrency. Device fingerprinting shows Account A and Account B share the same device (DEV-9981). The receiving UPI ID (scammer01@upi) has appeared in 3 prior complaints filed in the last 30 days.",
};
